<script setup lang="ts">
import { useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';

interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
}

const props = defineProps<{
  module: Module;
  idx: number;
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: 'save', payload: { title: string; description: string; order: number }): void;
  (e: 'remove' | 'addLesson'): void;
}>();

const { module } = toRefs(props);

// Zod schemas for each field
const titleSchema = toTypedSchema(zod.string().min(1, 'Название обязательно'));
const descriptionSchema = toTypedSchema(zod.string().min(1, 'Описание обязательно'));

// useField for each field
const {
  value: title,
  errorMessage: titleError,
  setValue: setTitle,
} = useField('title', titleSchema, { initialValue: '' });

const {
  value: description,
  errorMessage: descriptionError,
  setValue: setDescription,
} = useField('description', descriptionSchema, { initialValue: '' });

const { value: order, setValue: setOrder } = useField('order', undefined, {
  initialValue: 0,
});

const saveLoading = ref(false);
const saveError = ref('');
const saveSuccess = ref('');
const editing = ref(false);

onMounted(() => {
  console.log(module.value);
  console.log(module.value.title);

  console.log(title.value);

  setTitle((module.value.title as string) || '');
  console.log(title.value);

  setDescription((module.value.description as string) || '');
  setOrder((module.value.order as number) || props.idx + 1);
});

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
    order: order.value,
  });
  editing.value = false;
}
function handleRemove() {
  emit('remove');
}
function handleAddLesson() {
  emit('addLesson');
}
</script>
<template>
  <UICard>
    <UICardHeader>
      <UICardTitle>Модуль {{ idx + 1 }}</UICardTitle>
      <UICardDescription>Редактируйте модуль и его уроки</UICardDescription>
    </UICardHeader>
    <UICardContent>
      <div class="space-y-2">
        <div v-if="!editing">
          <div class="mb-2">
            <div class="font-semibold">Название модуля</div>
            <div>{{ title }}</div>
          </div>
          <div class="mb-2">
            <div class="font-semibold">Описание</div>
            <div>{{ description }}</div>
          </div>
          <UIButton type="button" @click="editing = true">Редактировать</UIButton>
        </div>
        <div v-else class="space-y-4">
          {{ title }}
          <FormInput
            :id="`module-title-${idx}`"
            v-model="title"
            label="Название модуля"
            placeholder="Введите название"
            :error="titleError"
          />
          {{ description }}
          <UITextarea
            v-model="description"
            label="Описание модуля"
            placeholder="Описание"
            rows="2"
            :class="{
              'border-destructive focus-visible:ring-destructive': descriptionError,
            }"
          />
          <div v-if="descriptionError" class="text-sm font-medium text-destructive">
            {{ descriptionError }}
          </div>
          <div class="flex gap-2 mt-2">
            <UIButton type="button" :disabled="saveLoading" @click="handleSave">
              <span v-if="saveLoading" class="flex items-center"
                ><span class="mr-2">Сохраняем...</span
                ><span
                  class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              /></span>
              <span v-else>Сохранить модуль</span>
            </UIButton>
            <UIButton type="button" variant="destructive" @click="handleRemove"
              >Удалить модуль</UIButton
            >
            <span v-if="saveSuccess" class="text-sm font-medium text-primary ml-4">{{
              saveSuccess
            }}</span>
            <span v-if="saveError" class="text-sm font-medium text-destructive ml-4">{{
              saveError
            }}</span>
          </div>
        </div>
      </div>
      <div class="mt-6">
        <div class="flex items-center justify-between">
          <h4 class="text-lg font-semibold">Уроки</h4>
          <UIButton v-if="editing" type="button" variant="secondary" @click="handleAddLesson"
            >Добавить урок</UIButton
          >
        </div>
        <slot name="lessons" />
      </div>
    </UICardContent>
  </UICard>
</template>
