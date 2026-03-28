import type { Page } from '@playwright/test'
import { setupFirebaseMock } from './firebase-mock'

const TEST_EMAIL = process.env.TEST_EMAIL ?? 'test@example.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'password123'

/**
 * UIを通じてログインし、ホーム画面が表示されるまで待機する。
 * Firebase APIコールを事前にモックするため、Firebase未接続環境でも動作する。
 */
export async function loginViaUI(page: Page): Promise<void> {
  // ページ遷移前にFirebase APIをモックしてネットワークハングを防ぐ
  await setupFirebaseMock(page, 'success')

  await page.goto('/login')

  // Firebase の onAuthStateChanged が発火してフォームが有効化されるまで待機
  await page.locator('.submit-btn:not([disabled])').waitFor({ timeout: 15000 })

  await page.getByLabel('メールアドレス').fill(TEST_EMAIL)
  await page.getByLabel('パスワード').fill(TEST_PASSWORD)
  await page.locator('.submit-btn').click()
  await page.waitForURL('/')
}
