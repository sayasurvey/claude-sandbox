<script setup lang="ts">
import { X, Plus, Trash2 } from 'lucide-vue-next'
import type { Schedule, ScheduleStatus, Project, ScheduleFormData, CustomTag } from '../../types'
import { TAG_LABELS, ALL_TAGS, MAX_CANDIDATE_COUNT } from '../../types'

const props = defineProps<{
  modelValue: boolean
  schedule?: Schedule
  initialDate?: Date
  initialProjectId?: string
  projects: Project[]
  customTags?: CustomTag[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [id: string | null, data: ScheduleFormData]
  delete: [id: string]
}>()

const title = ref('')
const projectId = ref('')
const status = ref<ScheduleStatus>('candidate')
const confirmedDateStr = ref('')
const candidateDateStrs = ref<string[]>([''])
const selectedTags = ref<string[]>([])

const isEditMode = computed(() => !!props.schedule)
const canAddDate = computed(
  () => status.value === 'candidate' && candidateDateStrs.value.length < MAX_CANDIDATE_COUNT,
)
const isSaveDisabled = computed(() => {
  if (!title.value.trim() || !projectId.value) return true
  if (status.value === 'confirmed') return !confirmedDateStr.value
  return !candidateDateStrs.value.some(Boolean)
})

const initForm = () => {
  if (props.schedule) {
    title.value = props.schedule.title
    projectId.value = props.schedule.projectId
    status.value = props.schedule.status
    selectedTags.value = [...props.schedule.tags]
    if (props.schedule.status === 'confirmed' && props.schedule.confirmedDate) {
      const dateStr = toDateInputString(props.schedule.confirmedDate.toDate())
      confirmedDateStr.value = dateStr
      // 確定日を候補日の初期値にも設定（ステータスを候補に変更した際に使用）
      candidateDateStrs.value = [dateStr]
    } else {
      const dates = props.schedule.candidateDates.map((t) => toDateInputString(t.toDate()))
      candidateDateStrs.value = dates.length > 0 ? dates : ['']
      // クリックした日付を優先し、なければ先頭の候補日を確定日の初期値に設定
      confirmedDateStr.value = props.initialDate
        ? toDateInputString(props.initialDate)
        : (dates[0] ?? '')
    }
  } else {
    title.value = ''
    projectId.value = props.initialProjectId ?? props.projects[0]?.id ?? ''
    status.value = 'candidate'
    selectedTags.value = []
    const initDate = props.initialDate ? toDateInputString(props.initialDate) : ''
    candidateDateStrs.value = [initDate]
    confirmedDateStr.value = initDate
  }
}

watch(
  [() => props.modelValue, () => props.schedule],
  ([open]) => {
    if (open) initForm()
  },
)

const addCandidateDate = () => {
  if (candidateDateStrs.value.length < MAX_CANDIDATE_COUNT) {
    candidateDateStrs.value.push('')
  }
}

const removeCandidateDate = (index: number) => {
  candidateDateStrs.value.splice(index, 1)
  if (candidateDateStrs.value.length === 0) candidateDateStrs.value = ['']
}

const close = () => emit('update:modelValue', false)

const handleSave = () => {
  if (isSaveDisabled.value) return

  const formData: ScheduleFormData = {
    title: title.value.trim(),
    projectId: projectId.value,
    status: status.value,
    confirmedDate:
      status.value === 'confirmed' && confirmedDateStr.value
        ? fromDateInputString(confirmedDateStr.value)
        : null,
    candidateDates:
      status.value === 'candidate'
        ? candidateDateStrs.value.filter(Boolean).map(fromDateInputString)
        : [],
    tags: [...selectedTags.value],
  }

  emit('save', isEditMode.value ? (props.schedule?.id ?? null) : null, formData)
  close()
}

const handleDelete = () => {
  if (props.schedule) {
    emit('delete', props.schedule.id)
    close()
  }
}
</script>

<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">{{ isEditMode ? '予定を編集' : '予定を追加' }}</h2>
        <button class="btn-close" @click="close">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="modal-body">
        <!-- タイトル -->
        <div class="field">
          <label class="field-label">タイトル</label>
          <input
            v-model="title"
            type="text"
            maxlength="50"
            placeholder="予定のタイトル"
            class="form-input"
          >
        </div>

        <!-- 案件 -->
        <div class="field">
          <label class="field-label">案件</label>
          <select v-model="projectId" class="form-input">
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>

        <!-- ステータス -->
        <div class="field">
          <label class="field-label">ステータス</label>
          <div class="radio-group">
            <label class="radio-label">
              <input v-model="status" type="radio" value="candidate" >
              <span class="status-badge status-badge--candidate">調整中</span>
            </label>
            <label class="radio-label">
              <input v-model="status" type="radio" value="confirmed" >
              <span class="status-badge status-badge--confirmed">確定</span>
            </label>
          </div>
        </div>

        <!-- 確定日 -->
        <div v-if="status === 'confirmed'" class="field">
          <label class="field-label">確定日</label>
          <input v-model="confirmedDateStr" type="date" class="form-input" >
        </div>

        <!-- 候補日 -->
        <div v-else class="field">
          <label class="field-label">候補日（最大 {{ MAX_CANDIDATE_COUNT }} 件）</label>
          <div
            v-for="(_, index) in candidateDateStrs"
            :key="index"
            class="candidate-date-row"
          >
            <input
              v-model="candidateDateStrs[index]"
              type="date"
              class="form-input flex-1"
            >
            <button
              v-if="candidateDateStrs.length > 1"
              class="btn-icon btn-icon--danger"
              @click="removeCandidateDate(index)"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <button v-if="canAddDate" class="add-date-btn" @click="addCandidateDate">
            <Plus class="w-4 h-4" />
            日付を追加
          </button>
        </div>

        <!-- タグ -->
        <div class="field">
          <label class="field-label">タグ</label>
          <div class="tag-group">
            <label v-for="tag in ALL_TAGS" :key="tag" class="tag-checkbox">
              <input v-model="selectedTags" type="checkbox" :value="tag" >
              <span>{{ TAG_LABELS[tag] }}</span>
            </label>
            <label v-for="ct in (customTags ?? [])" :key="ct.id" class="tag-checkbox">
              <input v-model="selectedTags" type="checkbox" :value="ct.id" >
              <span>{{ ct.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button v-if="isEditMode" class="btn-danger-outline" @click="handleDelete">
          <Trash2 class="w-4 h-4" />
          削除
        </button>
        <div v-else />
        <div class="action-right">
          <button class="btn-secondary" @click="close">キャンセル</button>
          <button class="btn-primary" :disabled="isSaveDisabled" @click="handleSave">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.modal-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4;
}

.modal {
  @apply bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0;
}

.modal-title {
  @apply text-base font-semibold text-gray-900;
}

.btn-close {
  @apply p-1 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-600
         transition-colors duration-200;
}

.modal-body {
  @apply px-6 py-4 overflow-y-auto flex flex-col gap-4;
}

.modal-actions {
  @apply flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-shrink-0;
}

.field {
  @apply flex flex-col gap-1.5;
}

.field-label {
  @apply text-sm font-medium text-gray-700;
}

.form-input {
  @apply w-full px-3 py-2 text-sm border border-gray-300 rounded-lg
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
         transition-colors duration-200;
}

.radio-group {
  @apply flex gap-4;
}

.radio-label {
  @apply flex items-center gap-2 cursor-pointer;
}

.status-badge {
  @apply text-xs px-2.5 py-1 rounded-full font-medium;
}

.status-badge--candidate {
  @apply bg-gray-100 text-gray-600;
}

.status-badge--confirmed {
  @apply bg-blue-100 text-blue-700;
}

.candidate-date-row {
  @apply flex gap-2 items-center mb-2;
}

.add-date-btn {
  @apply flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800
         transition-colors duration-200;
}

.tag-group {
  @apply flex flex-wrap gap-4;
}

.tag-checkbox {
  @apply flex items-center gap-1.5 cursor-pointer text-sm text-gray-700;
}

.btn-primary {
  @apply flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium
         rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
         transition-colors duration-200;
}

.btn-secondary {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300
         rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
         transition-colors duration-200;
}

.btn-danger-outline {
  @apply flex items-center gap-1 px-3 py-2 text-sm text-red-600 border border-red-200
         rounded-lg hover:bg-red-50 transition-colors duration-200;
}

.btn-icon {
  @apply p-1.5 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-600
         transition-colors duration-200;
}

.btn-icon--danger {
  @apply hover:bg-red-50 hover:text-red-500;
}

.action-right {
  @apply flex gap-2;
}
</style>
