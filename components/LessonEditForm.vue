<script setup lang="ts">
import { useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { Lesson, LessonUpdatePayload } from '~/drizzle/types';

const props = defineProps<{
  lesson: Omit<Lesson, 'moduleId'>;
  moduleId: number | string;
  idx: number;
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: 'save', payload: LessonUpdatePayload): void;
  (e: 'remove'): void;
}>();

const { lesson } = toRefs(props);

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

const { value: order, setValue: setOrder } = useField('order', undefined, {
  initialValue: 0,
});

const saveLoading = ref(false);
const saveError = ref('');
const saveSuccess = ref('');
const editing = ref(false);

onMounted(() => {
  setTitle(lesson.value.title);
  setContent(lesson.value.content);
  setOrder(lesson.value.order);
});

async function handleSave() {
  saveError.value = '';
  // Manually trigger validation for all fields
  const errors = [titleError.value, contentError.value].filter(Boolean);
  if (errors.length > 0) {
    saveError.value = errors[0] as string;
    return;
  }
  emit('save', {
    title: title.value,
    content: content.value,
    order: order.value,
  });
  editing.value = false;
}
function handleRemove() {
  emit('remove');
}
</script>
<template>
  <div class="mt-4 rounded border p-4">
    <div v-if="!editing">
      <div class="mb-2">
        <div class="font-semibold">Название урока</div>
        <div>{{ title }}</div>
      </div>
      <div class="mb-2">
        <div class="font-semibold">Контент</div>
        <div>{{ content }}</div>
      </div>
      <UIButton type="button" @click="editing = true">Редактировать</UIButton>
    </div>
    <div v-else class="space-y-4">
      <FormInput
        :id="`lesson-title-${props.moduleId}-${idx}`"
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
        <UIButton type="button" :disabled="saveLoading" @click="handleSave">
          <span v-if="saveLoading" class="flex items-center"
            ><span class="mr-2">Сохраняем...</span
            ><span
              class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          /></span>
          <span v-else>Сохранить урок</span>
        </UIButton>
        <UIButton type="button" variant="destructive" @click="handleRemove">Удалить урок</UIButton>
        <span v-if="saveSuccess" class="text-primary ml-4 text-sm font-medium">{{
          saveSuccess
        }}</span>
        <span v-if="saveError" class="text-destructive ml-4 text-sm font-medium">{{
          saveError
        }}</span>
      </div>
    </div>
  </div>
</template>
