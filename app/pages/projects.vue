<template>
  <div class="projects-container">
    <!-- ページヘッダー -->
    <div class="page-header">
      <div>
        <h1 class="page-title">案件一覧</h1>
        <p class="page-subtitle">登録されている案件を管理します</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <Plus class="w-4 h-4" />
        <span>新規追加</span>
      </button>
    </div>

    <!-- エラー表示 -->
    <div v-if="error" class="error-banner">{{ error }}</div>

    <!-- ローディング -->
    <div v-if="isLoading" class="loading-state">
      <Loader2 class="w-6 h-6 animate-spin text-blue-500" />
      <span>読み込み中...</span>
    </div>

    <!-- 空の状態 -->
    <div v-else-if="projects.length === 0" class="empty-state">
      <Briefcase class="empty-icon" />
      <p class="empty-title">案件がまだ登録されていません</p>
      <p class="empty-description">「新規追加」ボタンから最初の案件を登録しましょう</p>
    </div>

    <!-- 案件リスト -->
    <ul v-else class="project-list">
      <li v-for="project in projects" :key="project.id" class="project-card">
        <Briefcase class="project-icon" />
        <span class="project-name">{{ project.name }}</span>
        <div class="project-actions">
          <button class="btn-icon" title="編集" @click="openEditModal(project)">
            <Pencil class="w-4 h-4" />
          </button>
          <button class="btn-icon btn-icon--danger" title="削除" @click="openDeleteConfirm(project)">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </li>
    </ul>

    <!-- 追加/編集モーダル -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingProject ? '案件を編集' : '案件を追加' }}</h2>
          <button class="btn-close" @click="closeModal">
            <X class="w-5 h-5" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <label for="project-name" class="form-label">案件名</label>
            <input
              id="project-name"
              v-model="formName"
              class="form-input"
              :class="{ 'form-input--error': formError }"
              type="text"
              placeholder="案件名を入力してください"
              maxlength="30"
              autofocus
            >
            <div class="form-footer">
              <p v-if="formError" class="form-error-text">{{ formError }}</p>
              <span v-else />
              <span class="char-count" :class="{ 'char-count--limit': formName.length >= 30 }">
                {{ formName.length }}/30
              </span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" type="button" @click="closeModal">
              キャンセル
            </button>
            <button class="btn-primary" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? '保存中...' : (editingProject ? '更新' : '追加') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 削除確認モーダル -->
    <div v-if="deletingProject" class="modal-overlay" @click.self="deletingProject = null">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">案件を削除</h2>
        </div>
        <div class="modal-body">
          <p class="delete-message">
            「<strong>{{ deletingProject.name }}</strong>」を削除しますか？
          </p>
          <p class="delete-warning">
            紐づいているスケジュールもすべて削除されます。この操作は取り消せません。
          </p>
          <p v-if="deleteError" class="form-error-text mt-2">{{ deleteError }}</p>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" :disabled="isSubmitting" @click="deletingProject = null">
            キャンセル
          </button>
          <button class="btn-danger" :disabled="isSubmitting" @click="handleDelete">
            {{ isSubmitting ? '削除中...' : '削除する' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Briefcase, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-vue-next'
import type { Project } from '../../types'

const { projects, isLoading, error, addProject, updateProject, deleteProject } = useProjects()

const showModal = ref(false)
const editingProject = ref<Project | null>(null)
const deletingProject = ref<Project | null>(null)
const formName = ref('')
const formError = ref('')
const deleteError = ref('')
const isSubmitting = ref(false)

const openAddModal = () => {
  editingProject.value = null
  formName.value = ''
  formError.value = ''
  showModal.value = true
}

const openEditModal = (project: Project) => {
  editingProject.value = project
  formName.value = project.name
  formError.value = ''
  showModal.value = true
}

const openDeleteConfirm = (project: Project) => {
  deletingProject.value = project
  deleteError.value = ''
}

const closeModal = () => {
  showModal.value = false
  editingProject.value = null
  formName.value = ''
  formError.value = ''
}

const handleSubmit = async () => {
  const name = formName.value.trim()
  if (!name) {
    formError.value = '案件名を入力してください'
    return
  }

  isSubmitting.value = true
  formError.value = ''

  try {
    if (editingProject.value) {
      await updateProject(editingProject.value.id, name)
    } else {
      await addProject(name)
    }
    closeModal()
  } catch {
    formError.value = '保存に失敗しました。もう一度お試しください'
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  if (!deletingProject.value) return

  isSubmitting.value = true

  try {
    await deleteProject(deletingProject.value.id)
    deletingProject.value = null
  } catch {
    deleteError.value = '削除に失敗しました。もう一度お試しください'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.projects-container {
  @apply max-w-2xl mx-auto;
}

.page-header {
  @apply flex items-start justify-between mb-8 gap-4;
}

.page-title {
  @apply text-2xl font-bold text-gray-900;
}

.page-subtitle {
  @apply mt-1 text-sm text-gray-500;
}

.btn-primary {
  @apply flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium
         rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
         transition-colors duration-200 flex-shrink-0;
}

.btn-secondary {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300
         rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
         transition-colors duration-200;
}

.btn-danger {
  @apply px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg
         hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
         transition-colors duration-200;
}

.btn-icon {
  @apply p-1.5 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-600
         transition-colors duration-200;
}

.btn-icon--danger {
  @apply hover:bg-red-50 hover:text-red-500;
}

.btn-close {
  @apply p-1 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-600
         transition-colors duration-200;
}

.error-banner {
  @apply mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg;
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
  @apply text-base font-medium text-gray-500;
}

.empty-description {
  @apply mt-1 text-sm text-gray-400;
}

.project-list {
  @apply flex flex-col gap-3;
}

.project-card {
  @apply flex items-center gap-3 bg-white rounded-xl px-5 py-4 shadow-sm
         border border-gray-100;
}

.project-icon {
  @apply flex-shrink-0 w-5 h-5 text-blue-500;
}

.project-name {
  @apply flex-1 text-sm font-medium text-gray-900 truncate;
}

.project-actions {
  @apply flex items-center gap-1 flex-shrink-0;
}

/* モーダル */
.modal-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4;
}

.modal {
  @apply bg-white rounded-xl shadow-xl w-full max-w-md;
}

.modal-header {
  @apply flex items-center justify-between px-6 py-4 border-b border-gray-100;
}

.modal-title {
  @apply text-base font-semibold text-gray-900;
}

.modal-body {
  @apply px-6 py-4;
}

.modal-actions {
  @apply flex justify-end gap-2 px-6 py-4 border-t border-gray-100;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1.5;
}

.form-input {
  @apply w-full px-3 py-2 text-sm border border-gray-300 rounded-lg
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
         transition-colors duration-200;
}

.form-input--error {
  @apply border-red-400 focus:ring-red-400;
}

.form-footer {
  @apply flex items-center justify-between mt-1.5;
}

.form-error-text {
  @apply text-xs text-red-500;
}

.char-count {
  @apply text-xs text-gray-400 ml-auto;
}

.char-count--limit {
  @apply text-orange-500 font-medium;
}

.delete-message {
  @apply text-sm text-gray-700 mb-2;
}

.delete-warning {
  @apply text-sm text-red-500;
}
</style>
