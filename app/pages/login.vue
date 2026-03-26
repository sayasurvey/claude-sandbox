<template>
  <div class="login-page">
    <div class="login-card-wrapper">
      <!-- ロゴ・タイトル -->
      <div class="login-header">
        <div class="logo-icon-wrap">
          <div class="logo-icon-bg">
            <CalendarDays class="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 class="login-title">スケジュール管理</h1>
        <p class="login-subtitle">案件ごとのスケジュール管理アプリ</p>
      </div>

      <!-- タブ切り替え -->
      <div class="login-card">
        <div class="tab-bar">
          <button
            class="tab-btn"
            :class="isLoginMode ? 'tab-btn--active' : 'tab-btn--inactive'"
            @click="isLoginMode = true"
          >
            ログイン
          </button>
          <button
            class="tab-btn"
            :class="!isLoginMode ? 'tab-btn--active' : 'tab-btn--inactive'"
            @click="isLoginMode = false"
          >
            新規登録
          </button>
        </div>

        <div class="form-body">
          <!-- エラーメッセージ -->
          <div v-if="errorMessage" class="error-box">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- フォーム -->
          <form class="login-form" @submit.prevent="handleSubmit">
            <!-- メールアドレス -->
            <div>
              <label for="email" class="form-label">
                メールアドレス
              </label>
              <div class="input-wrapper">
                <Mail class="input-icon" />
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  placeholder="example@email.com"
                  class="text-input"
                />
              </div>
            </div>

            <!-- パスワード -->
            <div>
              <label for="password" class="form-label">
                パスワード
              </label>
              <div class="input-wrapper">
                <Lock class="input-icon" />
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="6文字以上"
                  minlength="6"
                  class="password-input"
                />
                <button
                  type="button"
                  class="toggle-password-btn"
                  @click="showPassword = !showPassword"
                >
                  <Eye v-if="showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- 送信ボタン -->
            <button
              type="submit"
              :disabled="isSubmitDisabled"
              class="submit-btn"
            >
              <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
              <span>{{ isLoginMode ? 'ログイン' : '新規登録' }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDays, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-vue-next'
import type { FirebaseUser } from '../../types/index'

// ログインページはデフォルトレイアウトを使わない
definePageMeta({
  layout: false,
  ssr: false,
})

const { signIn, signUp, currentUser, isLoading: isAuthLoading } = useAuth()
const router = useRouter()

// ログイン済みの場合はトップページにリダイレクト
watch(currentUser, (user: FirebaseUser | null) => {
  if (user) {
    router.push('/')
  }
}, { immediate: true })

const isLoginMode = ref(true)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const isSubmitDisabled = computed(() => isLoading.value || isAuthLoading.value)
const errorMessage = ref<string | null>(null)

/**
 * ログイン/新規登録フォームの送信処理
 */
const handleSubmit = async (): Promise<void> => {
  isLoading.value = true
  errorMessage.value = null

  try {
    if (isLoginMode.value) {
      await signIn(email.value, password.value)
    } else {
      await signUp(email.value, password.value)
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Firebase Auth エラーを日本語メッセージに変換する
 *
 * @param error - エラーオブジェクト
 * @returns 日本語エラーメッセージ
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'メールアドレスまたはパスワードが正しくありません'
      case 'auth/email-already-in-use':
        return 'このメールアドレスはすでに使用されています'
      case 'auth/weak-password':
        return 'パスワードは6文字以上で設定してください'
      case 'auth/invalid-email':
        return 'メールアドレスの形式が正しくありません'
      case 'auth/too-many-requests':
        return 'ログイン試行回数が多すぎます。しばらく待ってからお試しください'
      default:
        return error.message || '認証に失敗しました'
    }
  }
  return '認証に失敗しました'
}
</script>

<style scoped>
@reference "tailwindcss";

.login-page {
  @apply min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12;
}

.login-card-wrapper {
  @apply w-full max-w-md;
}

.login-header {
  @apply text-center mb-8;
}

.logo-icon-wrap {
  @apply flex justify-center mb-4;
}

.logo-icon-bg {
  @apply bg-blue-600 p-3 rounded-2xl;
}

.login-title {
  @apply text-2xl font-bold text-gray-900;
}

.login-subtitle {
  @apply mt-2 text-sm text-gray-600;
}

.login-card {
  @apply bg-white rounded-2xl shadow-lg overflow-hidden;
}

.tab-bar {
  @apply flex border-b;
}

.tab-btn {
  @apply flex-1 py-4 text-sm font-medium transition-colors;
}

.tab-btn--active {
  @apply text-blue-600 border-b-2 border-blue-600 bg-blue-50;
}

.tab-btn--inactive {
  @apply text-gray-500 hover:text-gray-700;
}

.form-body {
  @apply p-6 sm:p-8;
}

.error-box {
  @apply mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700;
}

.login-form {
  @apply space-y-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.input-wrapper {
  @apply relative;
}

.input-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400;
}

.text-input {
  @apply w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors;
}

.password-input {
  @apply w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors;
}

.toggle-password-btn {
  @apply absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600;
}

.submit-btn {
  @apply w-full py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2;
}
</style>
