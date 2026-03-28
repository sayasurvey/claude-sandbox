import { test, expect } from '@playwright/test'
import { setupFirebaseMock } from './helpers/firebase-mock'

test.describe('ログイン画面', () => {
  test.beforeEach(async ({ page }) => {
    // ページ遷移前にFirebase APIをモック（onAuthStateChangedをすぐに発火させる）
    await setupFirebaseMock(page)
    await page.goto('/login')
    // Firebase の onAuthStateChanged が発火し、フォームが有効化されるまで待機
    await page.locator('.submit-btn:not([disabled])').waitFor({ timeout: 15000 })
  })

  test('ページタイトルとサブタイトルが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'スケジュール管理' })).toBeVisible()
    await expect(page.getByText('案件ごとのスケジュール管理アプリ')).toBeVisible()
  })

  test('ログインタブと新規登録タブが表示される', async ({ page }) => {
    const tabBar = page.locator('.tab-bar')
    await expect(tabBar.getByRole('button', { name: 'ログイン' })).toBeVisible()
    await expect(tabBar.getByRole('button', { name: '新規登録' })).toBeVisible()
  })

  test('初期表示ではログインタブがアクティブになっている', async ({ page }) => {
    const loginTab = page.locator('.tab-bar').getByRole('button', { name: 'ログイン' })
    await expect(loginTab).toHaveClass(/tab-btn--active/)
  })

  test('新規登録タブをクリックするとタブが切り替わる', async ({ page }) => {
    const tabBar = page.locator('.tab-bar')
    await tabBar.getByRole('button', { name: '新規登録' }).click()

    // 新規登録タブがアクティブになる
    await expect(tabBar.getByRole('button', { name: '新規登録' })).toHaveClass(/tab-btn--active/)
    // 送信ボタンのテキストも「新規登録」に変わる
    await expect(page.locator('.submit-btn')).toContainText('新規登録')
  })

  test('メールアドレスとパスワードの入力フィールドが表示される', async ({ page }) => {
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード')).toBeVisible()
  })

  test('送信ボタンが表示される', async ({ page }) => {
    await expect(page.locator('.submit-btn')).toBeVisible()
  })

  test('パスワード表示トグルボタンが機能する', async ({ page }) => {
    const passwordInput = page.getByLabel('パスワード')
    const toggleBtn = page.locator('.toggle-password-btn')

    await expect(toggleBtn).toBeVisible()
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // トグルボタンをクリックしてパスワードを表示
    await toggleBtn.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // 再度クリックして非表示に戻す
    await toggleBtn.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('誤った認証情報でログインするとエラーメッセージが表示される', async ({ page }) => {
    // このテストだけ認証エラーを返すモックに切り替え
    await page.unroute('**/identitytoolkit.googleapis.com/**')
    await setupFirebaseMock(page, 'error')

    await page.getByLabel('メールアドレス').fill('wrong@example.com')
    await page.getByLabel('パスワード').fill('wrongpassword')
    await page.locator('.submit-btn').click()

    await expect(page.locator('.error-box')).toBeVisible({ timeout: 10000 })
  })

  test('メールアドレスの形式が不正な場合はブラウザバリデーションが働く', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill('invalid-email')
    await page.getByLabel('パスワード').fill('password123')
    await page.locator('.submit-btn').click()

    await expect(page).toHaveURL('/login')
  })

  test('パスワードが5文字以下の場合はブラウザバリデーションが働く', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill('test@example.com')
    await page.getByLabel('パスワード').fill('short')
    await page.locator('.submit-btn').click()

    await expect(page).toHaveURL('/login')
  })
})
