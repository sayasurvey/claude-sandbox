<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- ロゴ・タイトル -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <div class="bg-blue-600 p-3 rounded-2xl">
            <CalendarDays class="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">スケジュール管理</h1>
        <p class="mt-2 text-sm text-gray-600">案件ごとのスケジュール管理アプリ</p>
      </div>

      <!-- タブ切り替え -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="flex border-b">
          <button
            class="flex-1 py-4 text-sm font-medium transition-colors"
            :class="isLoginMode
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'"
            @click="isLoginMode = true"
          >
            ログイン
          </button>
          <button
            class="flex-1 py-4 text-sm font-medium transition-colors"
            :class="!isLoginMode
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'"
            @click="isLoginMode = false"
          >
            新規登録
          </button>
        </div>

        <div class="p-6 sm:p-8">
          <!-- エラーメッセージ -->
          <div
            v-if="errorMessage"
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700"
          >
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- フォーム -->
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- メールアドレス -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  placeholder="example@email.com"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <!-- パスワード -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="6文字以上"
                  minlength="6"
                  class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              class="w-full py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

// ログインページはデフォルトレイアウトを使わない
definePageMeta({
  layout: false,
  ssr: false,
})

const { signIn, signUp, currentUser, isLoading: isAuthLoading } = useAuth()
const router = useRouter()

// ログイン済みの場合はトップページにリダイレクト
watch(currentUser, (user) => {
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
    await router.push('/')
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
