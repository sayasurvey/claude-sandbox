<template>
  <div class="overloaded-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">過密日一覧</h1>
        <p class="page-subtitle">全案件の予定を合算して過密と判定された日の一覧です</p>
      </div>
      <NuxtLink to="/overloaded-settings" class="btn-settings">
        <Settings class="w-4 h-4" />
        条件設定
      </NuxtLink>
    </div>

    <!-- 有効な条件のサマリー -->
    <div class="condition-summary">
      <span v-if="settings.enableScheduleCountCheck" class="condition-badge condition-badge--blue">
        <CalendarDays class="w-3.5 h-3.5" />
        予定数 {{ settings.maxSchedulesPerDay }}件以上
      </span>
      <span v-if="settings.enableTagWorkloadCheck" class="condition-badge condition-badge--orange">
        <Tag class="w-3.5 h-3.5" />
        工数 {{ settings.tagWorkloadLimit }}超
      </span>
      <span
        v-if="!settings.enableScheduleCountCheck && !settings.enableTagWorkloadCheck"
        class="condition-badge condition-badge--gray"
      >
        条件が無効です。設定から有効にしてください。
      </span>
    </div>

    <div v-if="isLoading" class="loading-state">
      <Loader2 class="w-6 h-6 animate-spin text-blue-500" />
      <span>読み込み中...</span>
    </div>

    <div v-else-if="overloadedDays.length === 0" class="empty-state">
      <CheckCircle class="w-12 h-12 text-green-400" />
      <p class="empty-title">過密日はありません</p>
      <p class="empty-description">現在の条件に該当する日はありません</p>
    </div>

    <ul v-else class="day-list">
      <li v-for="day in overloadedDays" :key="day.dateKey" class="day-card">
        <div class="day-header">
          <div class="day-date-group">
            <span class="day-date" :class="getDayClass(day.date)">
              {{ formatDateLabel(day.date) }}
            </span>
            <span v-if="isToday(day.date)" class="today-badge">今日</span>
          </div>
          <div class="reason-badges">
            <span
              v-if="day.reasons.scheduleCount"
              class="reason-badge reason-badge--blue"
              :title="`予定数: ${day.scheduleCount}件`"
            >
              予定 {{ day.scheduleCount }}件
            </span>
            <span
              v-if="day.reasons.tagWorkload"
              class="reason-badge reason-badge--orange"
              :title="`工数合計: ${day.tagWorkload}`"
            >
              工数 {{ day.tagWorkload }}
            </span>
          </div>
        </div>

        <ul class="schedule-list">
          <li
            v-for="schedule in day.schedules"
            :key="schedule.id"
            class="schedule-item"
          >
            <span
              class="schedule-status"
              :class="schedule.status === 'confirmed' ? 'schedule-status--confirmed' : 'schedule-status--candidate'"
            >
              {{ schedule.status === 'confirmed' ? '確定' : '候補' }}
            </span>
            <span class="schedule-title">{{ schedule.title }}</span>
            <div class="schedule-tags">
              <span v-for="tag in schedule.tags" :key="tag" class="tag-chip">
                {{ getTagLabel(tag) }}
              </span>
            </div>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Loader2, Settings, CalendarDays, Tag, CheckCircle } from 'lucide-vue-next'
import { TAG_LABELS, isDefaultTag } from '../../types'
import type { Schedule } from '../../types'

const { schedules, isLoading: schedulesLoading } = useSchedules()
const { settings, isLoading: settingsLoading } = useCongestionSettings()

const isLoading = computed(() => schedulesLoading.value || settingsLoading.value)

/**
 * タグIDからラベルを返す（カスタムタグも対応）
 */
const getTagLabel = (tagId: string): string => {
  if (isDefaultTag(tagId)) return TAG_LABELS[tagId]
  return settings.value.customTags.find((ct) => ct.id === tagId)?.label ?? tagId
}

/**
 * タグ工数を返す
 */
const getTagWorkload = (tagId: string): number => {
  if (isDefaultTag(tagId)) return settings.value.defaultTagWorkloads[tagId]
  return settings.value.customTags.find((ct) => ct.id === tagId)?.workload ?? 0
}

interface OverloadedDay {
  dateKey: string
  date: Date
  schedules: Schedule[]
  scheduleCount: number
  tagWorkload: number
  reasons: {
    scheduleCount: boolean
    tagWorkload: boolean
  }
}

/**
 * 全スケジュールから日付ごとのマップを構築し、過密日を抽出する
 */
const overloadedDays = computed((): OverloadedDay[] => {
  const { enableScheduleCountCheck, maxSchedulesPerDay, enableTagWorkloadCheck, tagWorkloadLimit } = settings.value

  if (!enableScheduleCountCheck && !enableTagWorkloadCheck) return []

  // 日付キー → スケジュールリストのマップを構築
  const dateMap = new Map<string, Schedule[]>()
  for (const s of schedules.value) {
    const keys: string[] = []
    if (s.status === 'confirmed' && s.confirmedDate) {
      keys.push(toDateKey(s.confirmedDate.toDate()))
    } else {
      for (const t of s.candidateDates) {
        keys.push(toDateKey(t.toDate()))
      }
    }
    for (const key of keys) {
      if (!dateMap.has(key)) dateMap.set(key, [])
      dateMap.get(key)!.push(s)
    }
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = toDateKey(yesterday)

  const result: OverloadedDay[] = []
  for (const [dateKey, daySchedules] of dateMap) {
    if (dateKey < yesterdayKey) continue
    const scheduleCount = daySchedules.length
    const tagWorkload = daySchedules.reduce((sum, s) => {
      return sum + s.tags.reduce((tagSum, tagId) => tagSum + getTagWorkload(tagId), 0)
    }, 0)

    const countTriggered = enableScheduleCountCheck && scheduleCount >= maxSchedulesPerDay
    const workloadTriggered = enableTagWorkloadCheck && tagWorkload > tagWorkloadLimit

    if (countTriggered || workloadTriggered) {
      result.push({
        dateKey,
        date: fromDateInputString(dateKey),
        schedules: daySchedules,
        scheduleCount,
        tagWorkload,
        reasons: {
          scheduleCount: countTriggered,
          tagWorkload: workloadTriggered,
        },
      })
    }
  }

  return result.sort((a, b) => a.date.getTime() - b.date.getTime())
})

const isToday = (date: Date): boolean => {
  const today = new Date()
  return toDateKey(date) === toDateKey(today)
}

const getDayClass = (date: Date): string => {
  const day = date.getDay()
  if (day === 0) return 'day-date--sunday'
  if (day === 6) return 'day-date--saturday'
  return ''
}
</script>

<style scoped>
@reference "tailwindcss";

.overloaded-container {
  @apply max-w-2xl mx-auto pb-8;
}

.page-header {
  @apply flex items-start justify-between mb-4;
}

.page-title {
  @apply text-2xl font-bold text-gray-900;
}

.page-subtitle {
  @apply mt-1 text-sm text-gray-500;
}

.btn-settings {
  @apply flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200
         rounded-lg hover:bg-gray-50 transition-colors duration-200;
}

.condition-summary {
  @apply flex flex-wrap gap-2 mb-5;
}

.condition-badge {
  @apply inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full;
}

.condition-badge--blue {
  @apply bg-blue-50 text-blue-700;
}

.condition-badge--orange {
  @apply bg-orange-50 text-orange-700;
}

.condition-badge--gray {
  @apply bg-gray-100 text-gray-500;
}

.loading-state {
  @apply flex items-center gap-2 text-sm text-gray-500 py-12 justify-center;
}

.empty-state {
  @apply flex flex-col items-center gap-2 py-16 text-center;
}

.empty-title {
  @apply text-base font-semibold text-gray-700 mt-2;
}

.empty-description {
  @apply text-sm text-gray-400;
}

.day-list {
  @apply flex flex-col gap-3;
}

.day-card {
  @apply bg-white rounded-xl border border-gray-100 shadow-sm p-4;
}

.day-header {
  @apply flex items-center justify-between mb-3;
}

.day-date-group {
  @apply flex items-center gap-2;
}

.day-date {
  @apply text-base font-bold text-gray-900;
}

.day-date--sunday {
  @apply text-red-600;
}

.day-date--saturday {
  @apply text-blue-600;
}

.today-badge {
  @apply text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full;
}

.reason-badges {
  @apply flex gap-1.5;
}

.reason-badge {
  @apply text-xs font-medium px-2 py-0.5 rounded-full cursor-default;
}

.reason-badge--blue {
  @apply bg-blue-100 text-blue-700;
}

.reason-badge--orange {
  @apply bg-orange-100 text-orange-700;
}

.schedule-list {
  @apply flex flex-col gap-1.5;
}

.schedule-item {
  @apply flex items-center gap-2 text-sm;
}

.schedule-status {
  @apply flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium;
}

.schedule-status--confirmed {
  @apply bg-blue-100 text-blue-700;
}

.schedule-status--candidate {
  @apply bg-gray-100 text-gray-600;
}

.schedule-title {
  @apply flex-1 text-gray-800 truncate;
}

.schedule-tags {
  @apply flex flex-wrap gap-1 flex-shrink-0;
}

.tag-chip {
  @apply text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded;
}
</style>
