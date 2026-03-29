<script setup lang="ts">
import type { Schedule } from '../../types'
import { TAG_LABELS } from '../../types'

defineProps<{
  schedule: Schedule
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="schedule-card"
    :class="schedule.status === 'confirmed' ? 'schedule-card--confirmed' : 'schedule-card--candidate'"
    @click.stop="$emit('click')"
  >
    <span class="schedule-title">{{ schedule.title }}</span>
    <span v-if="schedule.tags.length > 0" class="schedule-tags">
      <span
        v-for="tag in schedule.tags"
        :key="tag"
        class="schedule-tag"
        :class="schedule.status === 'confirmed' ? 'schedule-tag--confirmed' : 'schedule-tag--candidate'"
      >
        {{ TAG_LABELS[tag] }}
      </span>
    </span>
  </button>
</template>

<style scoped>
@reference "tailwindcss";

.schedule-card {
  @apply w-full text-left rounded-md px-2 py-1 text-xs mb-1 cursor-pointer
         transition-opacity hover:opacity-75 block;
}

.schedule-card--confirmed {
  @apply bg-blue-100 text-blue-800 border border-blue-200;
}

.schedule-card--candidate {
  @apply bg-gray-100 text-gray-700 border border-gray-200;
}

.schedule-title {
  @apply block font-medium truncate;
}

.schedule-tags {
  @apply flex flex-wrap gap-0.5 mt-0.5;
}

.schedule-tag {
  @apply text-[10px] px-1 rounded-full;
}

.schedule-tag--confirmed {
  @apply bg-blue-200 text-blue-700;
}

.schedule-tag--candidate {
  @apply bg-gray-200 text-gray-500;
}
</style>
