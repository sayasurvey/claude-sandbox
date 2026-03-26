<template>
  <div class="home-container">
    <div class="home-header">
      <h1 class="home-title">ホーム</h1>
      <p class="home-subtitle">メニューを選択してください</p>
    </div>

    <div class="card-grid">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="menu-card"
      >
        <div class="card-icon" :class="item.colorClass">
          <component :is="item.icon" class="w-8 h-8" />
        </div>
        <div class="card-body">
          <h2 class="card-title">{{ item.title }}</h2>
          <p class="card-description">{{ item.description }}</p>
        </div>
        <ChevronRight class="card-arrow" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Briefcase, AlertTriangle, Settings, Calendar, ChevronRight } from 'lucide-vue-next'

const menuItems = [
  {
    to: '/projects',
    title: '案件一覧',
    description: '登録されている案件の一覧を確認します',
    icon: Briefcase,
    colorClass: 'icon-blue',
  },
  {
    to: '/overloaded-days',
    title: '過密日一覧',
    description: 'スケジュールが過密になっている日を確認します',
    icon: AlertTriangle,
    colorClass: 'icon-red',
  },
  {
    to: '/overloaded-settings',
    title: '過密日条件',
    description: '過密と判断する条件・閾値を設定します',
    icon: Settings,
    colorClass: 'icon-orange',
  },
  {
    to: '/calendar',
    title: 'カレンダー表示',
    description: '月カレンダーでスケジュールを一覧表示します',
    icon: Calendar,
    colorClass: 'icon-green',
  },
]
</script>

<style scoped>
@reference "tailwindcss";

.home-container {
  @apply max-w-2xl mx-auto;
}

.home-header {
  @apply mb-8;
}

.home-title {
  @apply text-2xl font-bold text-gray-900;
}

.home-subtitle {
  @apply mt-1 text-sm text-gray-500;
}

.card-grid {
  @apply flex flex-col gap-4;
}

.menu-card {
  @apply flex items-center gap-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100
         hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer;
}

.card-icon {
  @apply flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl;
}

.icon-blue {
  @apply bg-blue-50 text-blue-600;
}

.icon-red {
  @apply bg-red-50 text-red-500;
}

.icon-orange {
  @apply bg-orange-50 text-orange-500;
}

.icon-green {
  @apply bg-green-50 text-green-600;
}

.card-body {
  @apply flex-1 min-w-0;
}

.card-title {
  @apply text-base font-semibold text-gray-900;
}

.card-description {
  @apply mt-0.5 text-sm text-gray-500 truncate;
}

.card-arrow {
  @apply flex-shrink-0 w-5 h-5 text-gray-400;
}
</style>
