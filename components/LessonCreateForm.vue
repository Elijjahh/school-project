<script setup lang="ts">
import { useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { LessonPayload } from '~/drizzle/types';

const props = defineProps<{
  moduleId: number | string;
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: 'save', payload: LessonPayload): void;
}>();

// Zod schemas for each field
const titleSchema = toTypedSchema(zod.string().min(1, 'Название обязательно'));
const contentSchema = toTypedSchema(zod.string().min(1, 'Контент обязателен'));

// useField for each field
const {
  value: title,
  errorMessage: titleError,
  setValue: setTitle,
} = useField('title', titleSchema, { initialValue: '' });

const {
  value: content,
  errorMessage: contentError,
  setValue: setContent,
} = useField('content', contentSchema, { initialValue: '' });

const saveLoading = ref(false);
const saveError = ref('');

onMounted(() => {
  setTitle('');
  setContent('');
});

async function handleSave() {
  saveError.value = '';
  const errors = [titleError.value, contentError.value].filter(Boolean);
  if (errors.length > 0) {
    saveError.value = errors[0] as string;
    return;
  }
  emit('save', {
    title: title.value,
    content: content.value,
  });
}
</script>
<template>
  <div class="mt-4 rounded border p-4">
    <div class="space-y-4">
      <FormInput
        :id="`lesson-title-${props.moduleId}`"
        v-model="title"
        label="Название урока"
        placeholder="Введите название"
        :error="titleError"
      />
      <UITextarea
        v-model="content"
        label="Контент урока"
        placeholder="Контент"
        rows="3"
        :class="{ 'border-destructive focus-visible:ring-destructive': contentError }"
      />
      <div v-if="contentError" class="text-destructive text-sm font-medium">{{ contentError }}</div>
      <div class="mt-2 flex gap-2">
        <UIButton type="button" :disabled="saveLoading || props.loading" @click="handleSave">
          <span v-if="saveLoading || props.loading" class="flex items-center">
            <span class="mr-2">Сохраняем...</span>
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          </span>
          <span v-else>Создать урок</span>
        </UIButton>
        <span v-if="saveError" class="text-destructive ml-4 text-sm font-medium">
          {{ saveError }}
        </span>
      </div>
    </div>
  </div>
</template>
