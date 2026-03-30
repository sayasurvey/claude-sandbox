<template>
  <div class="settings-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">過密日の条件設定</h1>
        <p class="page-subtitle">いずれかの条件を満たした日が過密日になります</p>
      </div>
    </div>

    <div v-if="error" class="error-banner">{{ error }}</div>

    <div v-if="isLoading" class="loading-state">
      <Loader2 class="w-6 h-6 animate-spin text-blue-500" />
      <span>読み込み中...</span>
    </div>

    <template v-else>
      <!-- 予定数チェック -->
      <section class="settings-section">
        <div class="section-header">
          <div class="section-title-row">
            <CalendarDays class="w-5 h-5 text-blue-500" />
            <h2 class="section-title">1日の予定数</h2>
          </div>
          <label class="toggle">
            <input v-model="form.enableScheduleCountCheck" type="checkbox">
            <span class="toggle-track" :class="{ 'toggle-track--on': form.enableScheduleCountCheck }" />
          </label>
        </div>
        <p class="section-description">1日の予定数が指定件数以上になると過密日と判定します</p>
        <div class="field-row" :class="{ 'field-row--disabled': !form.enableScheduleCountCheck }">
          <label class="field-label">最大予定数</label>
          <div class="number-input-group">
            <input
              v-model.number="form.maxSchedulesPerDay"
              type="number"
              min="1"
              max="99"
              class="number-input"
              :disabled="!form.enableScheduleCountCheck"
            >
            <span class="number-unit">件以上</span>
          </div>
        </div>
      </section>

      <!-- タグ工数チェック -->
      <section class="settings-section">
        <div class="section-header">
          <div class="section-title-row">
            <Tag class="w-5 h-5 text-orange-500" />
            <h2 class="section-title">タグの工数</h2>
          </div>
          <label class="toggle">
            <input v-model="form.enableTagWorkloadCheck" type="checkbox">
            <span class="toggle-track" :class="{ 'toggle-track--on': form.enableTagWorkloadCheck }" />
          </label>
        </div>
        <p class="section-description">1日のタグ工数の合計が上限を超えると過密日と判定します</p>

        <div class="field-row" :class="{ 'field-row--disabled': !form.enableTagWorkloadCheck }">
          <label class="field-label">工数の上限</label>
          <div class="number-input-group">
            <input
              v-model.number="form.tagWorkloadLimit"
              type="number"
              min="1"
              max="999"
              class="number-input"
              :disabled="!form.enableTagWorkloadCheck"
            >
            <span class="number-unit">を超えると過密</span>
          </div>
        </div>

        <!-- デフォルトタグの工数 -->
        <div class="tag-workload-list" :class="{ 'tag-workload-list--disabled': !form.enableTagWorkloadCheck }">
          <h3 class="tag-workload-title">デフォルトタグの工数</h3>
          <div v-for="tag in ALL_TAGS" :key="tag" class="tag-workload-row">
            <span class="tag-label-badge tag-label-badge--default">{{ TAG_LABELS[tag] }}</span>
            <div class="number-input-group">
              <input
                v-model.number="form.defaultTagWorkloads[tag]"
                type="number"
                min="0"
                max="99"
                class="number-input number-input--sm"
                :disabled="!form.enableTagWorkloadCheck"
              >
              <span class="number-unit">工数</span>
            </div>
          </div>
        </div>

        <!-- カスタムタグ -->
        <div class="custom-tags-area" :class="{ 'custom-tags-area--disabled': !form.enableTagWorkloadCheck }">
          <div class="custom-tags-header">
            <h3 class="tag-workload-title">カスタムタグ</h3>
            <button
              class="add-custom-tag-btn"
              :disabled="!form.enableTagWorkloadCheck"
              @click="addCustomTag"
            >
              <Plus class="w-4 h-4" />
              タグを追加
            </button>
          </div>

          <div v-if="form.customTags.length === 0" class="custom-tags-empty">
            カスタムタグはまだ登録されていません
          </div>

          <div v-for="(customTag, index) in form.customTags" :key="customTag.id" class="custom-tag-row">
            <input
              v-model="customTag.label"
              type="text"
              maxlength="20"
              placeholder="タグ名"
              class="custom-tag-input"
              :disabled="!form.enableTagWorkloadCheck"
            >
            <div class="number-input-group">
              <input
                v-model.number="customTag.workload"
                type="number"
                min="0"
                max="99"
                class="number-input number-input--sm"
                :disabled="!form.enableTagWorkloadCheck"
              >
              <span class="number-unit">工数</span>
            </div>
            <button
              class="remove-tag-btn"
              :disabled="!form.enableTagWorkloadCheck"
              @click="removeCustomTag(index)"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <!-- 保存ボタン -->
      <div class="save-area">
        <p v-if="saveSuccess" class="save-success">
          <CheckCircle class="w-4 h-4" />
          設定を保存しました
        </p>
        <button class="btn-primary" :disabled="isSaving" @click="handleSave">
          <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          {{ isSaving ? '保存中...' : '設定を保存' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Loader2, CalendarDays, Tag, Plus, X, Save, CheckCircle } from 'lucide-vue-next'
import { TAG_LABELS, ALL_TAGS, DEFAULT_CONGESTION_SETTINGS } from '../../types'
import type { CustomTag, DefaultTagWorkloads } from '../../types'

const { settings, isLoading, error, saveSettings } = useCongestionSettings()

const form = reactive({
  enableScheduleCountCheck: DEFAULT_CONGESTION_SETTINGS.enableScheduleCountCheck,
  maxSchedulesPerDay: DEFAULT_CONGESTION_SETTINGS.maxSchedulesPerDay,
  enableTagWorkloadCheck: DEFAULT_CONGESTION_SETTINGS.enableTagWorkloadCheck,
  tagWorkloadLimit: DEFAULT_CONGESTION_SETTINGS.tagWorkloadLimit,
  defaultTagWorkloads: { ...DEFAULT_CONGESTION_SETTINGS.defaultTagWorkloads } as DefaultTagWorkloads,
  customTags: [] as CustomTag[],
})

// 設定が取得できたらフォームに反映
watch(settings, (s) => {
  form.enableScheduleCountCheck = s.enableScheduleCountCheck
  form.maxSchedulesPerDay = s.maxSchedulesPerDay
  form.enableTagWorkloadCheck = s.enableTagWorkloadCheck
  form.tagWorkloadLimit = s.tagWorkloadLimit
  form.defaultTagWorkloads = { ...s.defaultTagWorkloads }
  form.customTags = s.customTags.map((t) => ({ ...t }))
}, { immediate: true })

const isSaving = ref(false)
const saveSuccess = ref(false)

const addCustomTag = () => {
  form.customTags.push({
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: '',
    workload: 1,
  })
}

const removeCustomTag = (index: number) => {
  form.customTags.splice(index, 1)
}

const handleSave = async () => {
  isSaving.value = true
  saveSuccess.value = false
  try {
    await saveSettings({
      enableScheduleCountCheck: form.enableScheduleCountCheck,
      maxSchedulesPerDay: form.maxSchedulesPerDay,
      enableTagWorkloadCheck: form.enableTagWorkloadCheck,
      tagWorkloadLimit: form.tagWorkloadLimit,
      defaultTagWorkloads: { ...form.defaultTagWorkloads },
      customTags: form.customTags.filter((t) => t.label.trim()).map((t) => ({ ...t })),
    })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch {
    // エラーは saveSettings 内でログ出力
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.settings-container {
  @apply max-w-2xl mx-auto pb-8;
}

.page-header {
  @apply mb-6;
}

.page-title {
  @apply text-2xl font-bold text-gray-900;
}

.page-subtitle {
  @apply mt-1 text-sm text-gray-500;
}

.error-banner {
  @apply mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600;
}

.loading-state {
  @apply flex items-center gap-2 text-sm text-gray-500 py-8 justify-center;
}

.settings-section {
  @apply bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4;
}

.section-header {
  @apply flex items-center justify-between mb-2;
}

.section-title-row {
  @apply flex items-center gap-2;
}

.section-title {
  @apply text-base font-semibold text-gray-900;
}

.section-description {
  @apply text-sm text-gray-500 mb-4;
}

.toggle {
  @apply relative inline-flex cursor-pointer;
}

.toggle input {
  @apply sr-only;
}

.toggle-track {
  @apply w-11 h-6 bg-gray-200 rounded-full transition-colors duration-200 relative;
}

.toggle-track::after {
  content: '';
  @apply absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200;
}

.toggle input:checked + .toggle-track {
  @apply bg-blue-500;
}

.toggle input:checked + .toggle-track::after {
  transform: translateX(1.25rem);
}

.toggle-track--on::after {
  transform: translateX(1.25rem);
}

.field-row {
  @apply flex items-center justify-between py-2;
}

.field-row--disabled {
  @apply opacity-40;
}

.field-label {
  @apply text-sm font-medium text-gray-700;
}

.number-input-group {
  @apply flex items-center gap-2;
}

.number-input {
  @apply w-20 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-right
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
         disabled:bg-gray-50 disabled:cursor-not-allowed;
}

.number-input--sm {
  @apply w-16;
}

.number-unit {
  @apply text-sm text-gray-500;
}

.tag-workload-list {
  @apply mt-4 border-t border-gray-100 pt-4 flex flex-col gap-3;
}

.tag-workload-list--disabled {
  @apply opacity-40;
}

.tag-workload-title {
  @apply text-sm font-medium text-gray-700 mb-2;
}

.tag-workload-row {
  @apply flex items-center justify-between;
}

.tag-label-badge {
  @apply text-sm px-2.5 py-1 rounded-full;
}

.tag-label-badge--default {
  @apply bg-blue-50 text-blue-700;
}

.custom-tags-area {
  @apply mt-4 border-t border-gray-100 pt-4;
}

.custom-tags-area--disabled {
  @apply opacity-40;
}

.custom-tags-header {
  @apply flex items-center justify-between mb-3;
}

.custom-tags-empty {
  @apply text-sm text-gray-400 py-2 text-center;
}

.add-custom-tag-btn {
  @apply flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800
         disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200;
}

.custom-tag-row {
  @apply flex items-center gap-2 mb-2;
}

.custom-tag-input {
  @apply flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
         disabled:bg-gray-50 disabled:cursor-not-allowed;
}

.remove-tag-btn {
  @apply p-1.5 text-gray-400 rounded-md hover:bg-red-50 hover:text-red-500
         disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200;
}

.save-area {
  @apply flex items-center justify-end gap-3 mt-2;
}

.save-success {
  @apply flex items-center gap-1.5 text-sm text-green-600;
}

.btn-primary {
  @apply flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium
         rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
         transition-colors duration-200;
}
</style>
