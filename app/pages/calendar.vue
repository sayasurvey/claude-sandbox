<script setup lang="ts">
import { Timestamp } from 'firebase/firestore'
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-vue-next'
import type { Schedule, ScheduleInput, ScheduleFormData } from '../../types'

const { projects } = useProjects()
const { schedules, isLoading, addSchedule, updateSchedule, deleteSchedule, confirmSchedule } =
  useSchedules()

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())

const datesInMonth = computed(() => getDatesInMonth(currentYear.value, currentMonth.value))

// 日付 × 案件のスケジュールマップを構築
const scheduleMap = computed(() => {
  const map = new Map<string, Map<string, Schedule[]>>()
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
      if (!map.has(key)) map.set(key, new Map())
      const projectMap = map.get(key)!
      if (!projectMap.has(s.projectId)) projectMap.set(s.projectId, [])
      projectMap.get(s.projectId)!.push(s)
    }
  }
  return map
})

const getSchedulesForCell = (date: Date, pid: string): Schedule[] =>
  scheduleMap.value.get(toDateKey(date))?.get(pid) ?? []

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentYear.value--
    currentMonth.value = 11
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentYear.value++
    currentMonth.value = 0
  } else {
    currentMonth.value++
  }
}

// セルホバー状態管理
const hoveredCellKey = ref<string | null>(null)
const cellKey = (date: Date, pid: string) => `${toDateKey(date)}_${pid}`

// モーダル状態
const showModal = ref(false)
const modalInitialDate = ref<Date | undefined>()
const modalInitialProjectId = ref<string | undefined>()
const editingSchedule = ref<Schedule | undefined>()

const openAddModal = (date?: Date, pid?: string) => {
  editingSchedule.value = undefined
  modalInitialDate.value = date
  modalInitialProjectId.value = pid
  showModal.value = true
}

const openEditModal = (schedule: Schedule, clickDate?: Date) => {
  editingSchedule.value = schedule
  // 候補日の場合はクリックした日付を確定日の初期値として渡す（ステータス変更時に使用）
  modalInitialDate.value = schedule.status === 'candidate' ? clickDate : undefined
  modalInitialProjectId.value = undefined
  showModal.value = true
}

const handleSave = async (id: string | null, data: ScheduleFormData) => {
  const input: ScheduleInput = {
    title: data.title,
    projectId: data.projectId,
    status: data.status,
    confirmedDate: data.confirmedDate ? Timestamp.fromDate(data.confirmedDate) : null,
    candidateDates: data.candidateDates.map((d) => Timestamp.fromDate(d)),
    tags: data.tags,
  }

  try {
    if (!id) {
      await addSchedule(input)
    } else {
      const existing = schedules.value.find((s) => s.id === id)
      if (existing?.status === 'candidate' && input.status === 'confirmed') {
        await confirmSchedule(id, input)
      } else {
        await updateSchedule(id, input)
      }
    }
  } catch (e) {
    console.error('保存エラー:', e)
  }
}

const handleDelete = async (id: string) => {
  try {
    await deleteSchedule(id)
  } catch (e) {
    console.error('削除エラー:', e)
  }
}
</script>

<template>
  <div class="calendar-page">
    <!-- ページヘッダー -->
    <div class="page-header">
      <div>
        <h1 class="page-title">カレンダー</h1>
        <p class="page-subtitle">案件ごとの予定を月単位で確認します</p>
      </div>
      <div class="month-nav">
        <button class="nav-btn" @click="prevMonth">
          <ChevronLeft class="w-4 h-4" />
        </button>
        <span class="month-label">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
        <button class="nav-btn" @click="nextMonth">
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- ローディング -->
    <div v-if="isLoading" class="loading-state">
      <Loader2 class="w-6 h-6 animate-spin text-blue-500" />
      <span>読み込み中...</span>
    </div>

    <!-- 案件なし -->
    <div v-else-if="projects.length === 0" class="empty-state">
      <Calendar class="empty-icon" />
      <p class="empty-title">案件が登録されていません</p>
      <NuxtLink to="/projects" class="empty-link">案件を追加する →</NuxtLink>
    </div>

    <!-- カレンダーグリッド -->
    <div v-else class="calendar-wrapper">
      <table class="calendar-table">
        <thead>
          <tr>
            <th class="date-col-header">日付</th>
            <th
              v-for="project in projects"
              :key="project.id"
              class="project-col-header"
            >
              {{ project.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="date in datesInMonth" :key="toDateKey(date)" class="calendar-row">
            <!-- 日付列 -->
            <td
              class="date-cell"
              :class="{
                'date-cell--sunday': date.getDay() === 0,
                'date-cell--saturday': date.getDay() === 6,
              }"
            >
              {{ formatDateLabel(date) }}
            </td>

            <!-- 案件セル -->
            <td
              v-for="project in projects"
              :key="project.id"
              class="schedule-cell"
              @mouseenter="hoveredCellKey = cellKey(date, project.id)"
              @mouseleave="hoveredCellKey = null"
            >
              <ScheduleCard
                v-for="s in getSchedulesForCell(date, project.id)"
                :key="s.id"
                :schedule="s"
                @click="openEditModal(s, date)"
              />
              <button
                v-if="hoveredCellKey === cellKey(date, project.id)"
                class="add-cell-btn"
                @click="openAddModal(date, project.id)"
              >
                +
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- FAB -->
    <button class="fab" @click="openAddModal()">+</button>

    <!-- 予定追加/編集モーダル -->
    <ScheduleModal
      v-model="showModal"
      :schedule="editingSchedule"
      :initial-date="modalInitialDate"
      :initial-project-id="modalInitialProjectId"
      :projects="projects"
      @save="handleSave"
      @delete="handleDelete"
    />
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.calendar-page {
  @apply relative;
}

.page-header {
  @apply flex items-start justify-between mb-6 gap-4;
}

.page-title {
  @apply text-2xl font-bold text-gray-900;
}

.page-subtitle {
  @apply mt-1 text-sm text-gray-500;
}

.month-nav {
  @apply flex items-center gap-2;
}

.nav-btn {
  @apply p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors duration-200;
}

.month-label {
  @apply text-base font-semibold text-gray-700 min-w-[7rem] text-center;
}

.loading-state {
  @apply flex items-center justify-center gap-2 py-16 text-gray-500 text-sm;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}

.empty-icon {
  @apply w-12 h-12 text-gray-300 mb-3;
}

.empty-title {
  @apply text-base font-medium text-gray-500 mb-2;
}

.empty-link {
  @apply text-sm text-blue-600 hover:underline;
}

.calendar-wrapper {
  @apply overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm;
}

.calendar-table {
  @apply w-full border-collapse text-sm;
}

.date-col-header {
  @apply sticky left-0 w-20 px-3 py-2.5 text-left text-xs font-medium text-gray-500
         bg-gray-50 border-b border-r border-gray-200 whitespace-nowrap z-10;
}

.project-col-header {
  @apply min-w-[160px] px-3 py-2.5 text-left text-xs font-medium text-gray-700
         bg-gray-50 border-b border-r border-gray-200 last:border-r-0;
}

.calendar-row {
  @apply border-b border-gray-100 last:border-b-0;
}

.date-cell {
  @apply sticky left-0 px-3 py-2 border-r border-gray-200 text-xs font-medium
         whitespace-nowrap align-top bg-white z-10;
}

.date-cell--sunday {
  @apply text-red-500;
}

.date-cell--saturday {
  @apply text-blue-500;
}

.schedule-cell {
  @apply relative px-2 py-1.5 border-r border-gray-100 last:border-r-0 align-top h-14;
}

.add-cell-btn {
  @apply absolute bottom-1 right-1 w-5 h-5 flex items-center justify-center
         bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-colors duration-200
         leading-none;
}

.fab {
  @apply fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg
         hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center
         text-2xl font-light z-40;
}
</style>
