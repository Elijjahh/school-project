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
  validate: validateTitle,
} = useField('title', titleSchema, {
  initialValue: '',
  validateOnValueUpdate: false,
});

const {
  value: content,
  errorMessage: contentError,
  setValue: setContent,
  validate: validateContent,
} = useField('content', contentSchema, {
  initialValue: '',
  validateOnValueUpdate: false,
});

const { value: videoUrl, setValue: setVideoUrl } = useField('videoUrl', undefined, {
  initialValue: null as string | null,
});

// Состояние взаимодействия с полями
const titleTouched = ref(false);
const contentTouched = ref(false);

const saveLoading = ref(false);
const saveError = ref('');

onMounted(() => {
  setTitle('');
  setContent('');
  setVideoUrl(null);
});

// Computed properties для показа ошибок только после взаимодействия
const showTitleError = computed(() => (titleTouched.value ? titleError.value : undefined));
const showContentError = computed(() => (contentTouched.value ? contentError.value : undefined));

function onTitleBlur() {
  titleTouched.value = true;
  validateTitle();
}

function onContentBlur() {
  contentTouched.value = true;
  validateContent();
}

async function handleSave() {
  saveError.value = '';

  // Отмечаем все поля как затронутые
  titleTouched.value = true;
  contentTouched.value = true;

  // Валидируем все поля
  const titleResult = await validateTitle();
  const contentResult = await validateContent();

  if (!titleResult.valid || !contentResult.valid) {
    saveError.value =
      titleResult.errors[0] || contentResult.errors[0] || 'Пожалуйста, заполните все поля';
    return;
  }

  emit('save', {
    title: title.value,
    content: content.value,
    videoUrl: videoUrl.value || undefined,
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
        :error="showTitleError"
        @blur="onTitleBlur"
      />
      <UITextarea
        v-model="content"
        label="Контент урока"
        placeholder="Контент"
        rows="3"
        :class="{ 'border-destructive focus-visible:ring-destructive': showContentError }"
        @blur="onContentBlur"
      />
      <div v-if="showContentError" class="text-destructive text-sm font-medium">
        {{ contentError }}
      </div>

      <UIVideoUpload v-model="videoUrl" label="Видео урока (необязательно)" />

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
