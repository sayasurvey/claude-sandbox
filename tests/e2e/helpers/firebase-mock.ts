import type { Page } from '@playwright/test'

const MOCK_UID = 'test-uid-001'
const MOCK_EMAIL = 'test@example.com'

/**
 * Firebase SDK が受け入れるモックJWTトークンを生成する（署名なし）
 * Firebase Client SDK はクライアント側では署名検証を行わない
 */
function createMockIdToken(): string {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? 'test-project'
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    iss: `https://securetoken.google.com/${projectId}`,
    aud: projectId,
    auth_time: now - 60,
    user_id: MOCK_UID,
    sub: MOCK_UID,
    iat: now - 60,
    exp: now + 3540,
    email: MOCK_EMAIL,
    email_verified: true,
    firebase: {
      identities: { email: [MOCK_EMAIL] },
      sign_in_provider: 'password',
    },
  })).toString('base64url')
  return `${header}.${payload}.mock-signature`
}

/**
 * Firebase の全APIコールをモックする。
 *
 * DockerコンテナなどFirebaseに到達できない環境で、ネットワーク接続がハングして
 * onAuthStateChanged が発火しない問題を防ぐ。
 * page.goto() の前に呼び出すこと。
 *
 * @param page - PlaywrightのPageオブジェクト
 * @param signInResult - 'success' | 'error' ログイン結果のモック
 */
export async function setupFirebaseMock(
  page: Page,
  signInResult: 'success' | 'error' = 'success',
): Promise<void> {
  const mockToken = createMockIdToken()
  const nowMs = Date.now()
  const nowSec = Math.floor(nowMs / 1000)

  // Firebase Auth REST API (identitytoolkit.googleapis.com)
  await page.route('**/identitytoolkit.googleapis.com/**', async route => {
    const url = route.request().url()

    if (url.includes('accounts:signInWithPassword')) {
      if (signInResult === 'error') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: 400,
              message: 'INVALID_PASSWORD',
              errors: [{ message: 'INVALID_PASSWORD', domain: 'global', reason: 'invalid' }],
            },
          }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            kind: 'identitytoolkit#VerifyPasswordResponse',
            localId: MOCK_UID,
            email: MOCK_EMAIL,
            displayName: '',
            idToken: mockToken,
            registered: true,
            refreshToken: 'mock-refresh-token',
            expiresIn: '3600',
          }),
        })
      }
    } else if (url.includes('accounts:lookup')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#GetAccountInfoResponse',
          users: [{
            localId: MOCK_UID,
            email: MOCK_EMAIL,
            emailVerified: true,
            passwordHash: 'mock-hash',
            passwordUpdatedAt: nowMs,
            validSince: String(nowSec - 120),
            disabled: false,
            lastLoginAt: String(nowMs),
            createdAt: String(nowMs),
            providerUserInfo: [{ providerId: 'password', email: MOCK_EMAIL }],
          }],
        }),
      })
    } else {
      // その他のAuth APIはすぐに中止して接続ハングを防ぐ
      await route.abort()
    }
  })

  // トークンリフレッシュ (securetoken.googleapis.com)
  await page.route('**/securetoken.googleapis.com/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: mockToken,
        expires_in: '3600',
        token_type: 'Bearer',
        refresh_token: 'mock-refresh-token',
        id_token: mockToken,
        user_id: MOCK_UID,
        project_id: process.env.FIREBASE_PROJECT_ID ?? 'test-project',
      }),
    })
  })

  // Firestore REST API: 空のコレクション結果を返す
  // abort() ではなく空レスポンスを返すことで、Vue の reactivity が正常に動作する
  await page.route('**/firestore.googleapis.com/**', async route => {
    const url = route.request().url()

    if (url.includes(':runQuery')) {
      // getDocs(query(...)) に対して空のクエリ結果を返す
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { readTime: new Date().toISOString() },
        ]),
      })
    } else if (url.includes(':batchWrite') || url.includes(':commit')) {
      // 書き込み操作（追加・更新・削除）
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ writeResults: [{ updateTime: new Date().toISOString() }] }),
      })
    } else {
      // その他のFirestore APIは空レスポンスを返す（abort だと SDK がエラー状態になることがある）
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    }
  })

  // その他のGoogleAPI（FCMなど）もすぐに中止
  await page.route('**/firebase.googleapis.com/**', async route => {
    await route.abort()
  })
}
