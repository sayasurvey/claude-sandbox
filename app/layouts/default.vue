<template>
  <div class="layout-wrapper">
    <!-- ヘッダー -->
    <header class="site-header">
      <div class="header-inner">
        <div class="header-content">
          <!-- ロゴ -->
          <NuxtLink to="/" class="site-logo">
            <CalendarDays class="w-6 h-6" />
            <span class="text-lg font-bold">スケジュール管理</span>
          </NuxtLink>

          <!-- ログアウトボタン -->
          <button class="logout-btn" @click="handleSignOut">
            <LogOut class="w-4 h-4" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { CalendarDays, LogOut } from 'lucide-vue-next'

const { signOut } = useAuth()
const router = useRouter()

/**
 * ログアウト処理
 */
const handleSignOut = async (): Promise<void> => {
  try {
    await signOut()
    await router.push('/login')
  } catch (error) {
    console.error('ログアウトに失敗しました:', error)
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.layout-wrapper {
  @apply min-h-screen bg-gray-50;
}

.site-header {
  @apply bg-white shadow-sm sticky top-0 z-50;
}

.header-inner {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.header-content {
  @apply flex items-center justify-between h-16;
}

.site-logo {
  @apply flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors;
}

.logout-btn {
  @apply flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors;
}

.main-content {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8;
}
</style>
