import { test, expect } from '@playwright/test'
import { loginViaUI } from './helpers/auth'
import { setupFirebaseMock } from './helpers/firebase-mock'

test.describe('ホーム画面（未認証）', () => {
  test.beforeEach(async ({ page }) => {
    // Firebase初期化がハングしないようにモックを設定
    await setupFirebaseMock(page)
  })

  test('未ログイン状態でアクセスするとログイン画面にリダイレクトされる', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })
})

test.describe('ホーム画面（認証済み）', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page)
  })

  test('ページタイトルとサブタイトルが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'ホーム' })).toBeVisible()
    await expect(page.getByText('メニューを選択してください')).toBeVisible()
  })

  test('メニューカードが4件表示される', async ({ page }) => {
    await expect(page.locator('.menu-card')).toHaveCount(4)
  })

  test('案件一覧メニューが表示される', async ({ page }) => {
    const card = page.locator('.menu-card', { hasText: '案件一覧' })
    await expect(card).toBeVisible()
    await expect(card).toContainText('登録されている案件の一覧を確認します')
  })

  test('過密日一覧メニューが表示される', async ({ page }) => {
    const card = page.locator('.menu-card', { hasText: '過密日一覧' })
    await expect(card).toBeVisible()
    await expect(card).toContainText('スケジュールが過密になっている日を確認します')
  })

  test('過密日条件メニューが表示される', async ({ page }) => {
    const card = page.locator('.menu-card', { hasText: '過密日条件' })
    await expect(card).toBeVisible()
    await expect(card).toContainText('過密と判断する条件・閾値を設定します')
  })

  test('カレンダー表示メニューが表示される', async ({ page }) => {
    const card = page.locator('.menu-card', { hasText: 'カレンダー表示' })
    await expect(card).toBeVisible()
    await expect(card).toContainText('月カレンダーでスケジュールを一覧表示します')
  })

  test('案件一覧カードをクリックすると/projectsに遷移する', async ({ page }) => {
    await page.locator('.menu-card', { hasText: '案件一覧' }).click()
    await expect(page).toHaveURL('/projects')
  })
})
