import type { Auth } from 'firebase/auth'

/**
 * 認証ガードミドルウェア
 *
 * 未ログインユーザーが保護されたページにアクセスしようとした場合、
 * /login ページにリダイレクトする。
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // ログインページはスキップ
  if (to.path === '/login') {
    return
  }

  // SSRではスキップ（Firebase AuthはクライアントSDKのみ）
  if (import.meta.server) {
    return
  }

  const { $auth } = useNuxtApp()
  if (!$auth) {
    return
  }

  const auth = $auth as Auth

  // Firebase の認証状態が確定するまで待機（初回のみPromiseとしてresolve）
  await auth.authStateReady()

  // 未ログインの場合はログインページにリダイレクト
  if (!auth.currentUser) {
    return navigateTo('/login')
  }
})
