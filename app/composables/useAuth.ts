import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth'

/**
 * Firebase Authentication の状態管理コンポーザブル
 *
 * @returns currentUser - 現在ログイン中のユーザー（reactiveなref）
 * @returns isLoading - 認証状態の読み込み中フラグ
 * @returns signIn - メール/パスワードでログイン
 * @returns signUp - 新規ユーザー登録
 * @returns signOut - ログアウト
 */
export const useAuth = () => {
  const { $auth } = useNuxtApp()
  const auth = $auth as Auth

  // ユーザー状態（グローバルに共有するためuseState使用）
  const currentUser = useState<User | null>('auth-user', () => null)
  const isLoading = useState<boolean>('auth-loading', () => true)
  // 重複登録を防ぐフラグ
  const isWatching = useState<boolean>('auth-watching', () => false)

  // 認証状態の変化を監視（クライアントサイドのみ・初回のみ登録）
  if (auth && !isWatching.value) {
    isWatching.value = true
    onAuthStateChanged(auth, (user) => {
      currentUser.value = user
      isLoading.value = false
    })
  }

  /**
   * メール/パスワードでログイン
   * @param email - メールアドレス
   * @param password - パスワード
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      currentUser.value = result.user
    } catch (error) {
      console.error('ログインエラー:', error)
      throw error
    }
  }

  /**
   * 新規ユーザー登録
   * @param email - メールアドレス
   * @param password - パスワード
   */
  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      currentUser.value = result.user
    } catch (error) {
      console.error('新規登録エラー:', error)
      throw error
    }
  }

  /**
   * ログアウト
   */
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth)
      currentUser.value = null
    } catch (error) {
      console.error('ログアウトエラー:', error)
      throw error
    }
  }

  return {
    currentUser: computed(() => currentUser.value),
    isLoading: computed(() => isLoading.value),
    signIn,
    signUp,
    signOut,
  }
}
