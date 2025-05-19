<script setup lang="ts">
import { useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';

const props = defineProps<{ loading?: boolean }>();
const emit = defineEmits<{
  (e: 'save', payload: { title: string; description: string }): void;
}>();

// Zod schemas for each field
const titleSchema = toTypedSchema(zod.string().min(1, 'Название обязательно'));
const descriptionSchema = toTypedSchema(zod.string().min(1, 'Описание обязательно'));

// useField for each field
const { value: title, errorMessage: titleError } = useField('title', titleSchema, {
  initialValue: '',
});

const { value: description, errorMessage: descriptionError } = useField(
  'description',
  descriptionSchema,
  { initialValue: '' },
);

const saveError = ref('');

async function handleSave() {
  saveError.value = '';
  // Manually trigger validation for all fields
  const errors = [titleError.value, descriptionError.value].filter(Boolean);
  if (errors.length > 0) {
    saveError.value = errors[0] as string;
    return;
  }
  emit('save', {
    title: title.value,
    description: description.value,
  });
}
</script>
<template>
  <UICard>
    <UICardHeader>
      <UICardTitle>Создать модуль</UICardTitle>
      <UICardDescription>Заполните информацию о новом модуле</UICardDescription>
    </UICardHeader>
    <UICardContent>
      <div class="space-y-4">
        <FormInput
          id="module-title"
          v-model="title"
          label="Название модуля"
          placeholder="Введите название"
          :error="titleError"
        />
        <UITextarea
          v-model="description"
          label="Описание модуля"
          placeholder="Описание"
          rows="2"
          :class="{
            'border-destructive focus-visible:ring-destructive': descriptionError,
          }"
        />
        <div v-if="descriptionError" class="text-destructive text-sm font-medium">
          {{ descriptionError }}
        </div>
        <UIButton type="button" :disabled="props.loading" @click="handleSave">
          <span v-if="props.loading" class="flex items-center"
            ><span class="mr-2">Сохраняем...</span>
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          </span>
          <span v-else>Создать модуль</span>
        </UIButton>
        <span v-if="saveError" class="text-destructive ml-4 text-sm font-medium">{{
          saveError
        }}</span>
      </div>
    </UICardContent>
  </UICard>
</template>
