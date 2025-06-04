<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { TeacherApplication } from '~/drizzle/types';

definePageMeta({
  layout: 'profile',
});

const { user } = useUserSession();

// Проверяем роль пользователя
if (user.value?.role !== 'student') {
  throw createError({
    statusCode: 403,
    statusMessage: 'Только студенты могут подавать заявки на роль преподавателя',
  });
}

// Получаем информацию о существующей заявке
const { data: applicationData } = await useFetch('/api/teacher-applications/my', {
  server: false,
});

const application = computed(() => applicationData.value as TeacherApplication | null);

// Функция для получения текста статуса
const getStatusText = (status: string | null) => {
  switch (status) {
    case 'pending':
      return 'На рассмотрении';
    case 'approved':
      return 'Одобрено';
    case 'rejected':
      return 'Отклонено';
    default:
      return 'Неизвестно';
  }
};

// Схема валидации
const validationSchema = toTypedSchema(
  zod.object({
    motivation: zod
      .string({ message: 'Это обязательное поле' })
      .min(10, { message: 'Мотивация должна содержать минимум 10 символов' }),
    experience: zod.string().optional(),
    education: zod.string().optional(),
  }),
);

const { handleSubmit, errors } = useForm({
  validationSchema,
  initialValues: {
    motivation: '',
    experience: '',
    education: '',
  },
});

const motivationInputId = useId();
const experienceInputId = useId();
const educationInputId = useId();

const { value: motivation } = useField<string>('motivation');
const { value: experience } = useField<string>('experience');
const { value: education } = useField<string>('education');

const loading = ref(false);
const error = ref('');
const success = ref('');

const onSubmit = handleSubmit(async () => {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await $fetch('/api/teacher-applications', {
      method: 'POST',
      body: {
        motivation: motivation.value,
        experience: experience.value || undefined,
        education: education.value || undefined,
      },
    });

    success.value = 'Заявка успешно подана! Администратор рассмотрит её в ближайшее время.';

    // Перенаправляем на страницу настроек после успешной подачи
    setTimeout(() => {
      navigateTo('/app/settings');
    }, 2000);
  } catch (err) {
    if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 409) {
      error.value = 'У вас уже есть активная заявка';
    } else {
      error.value = 'Произошла ошибка при подаче заявки';
    }
  } finally {
    loading.value = false;
  }
});

useSeoMeta({
  title: 'Подача заявки на роль преподавателя',
  description: 'Подайте заявку на получение роли преподавателя',
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mx-auto max-w-2xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Заявка на роль преподавателя</h1>
        <p class="mt-2 text-gray-600">
          Заполните форму ниже, чтобы подать заявку на получение роли преподавателя
        </p>
      </div>

      <!-- Если заявка уже подана -->
      <div
        v-if="application && application.status !== 'rejected'"
        class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
      >
        <h2 class="mb-2 text-lg font-semibold text-blue-900">Заявка уже подана</h2>
        <p class="text-blue-800">
          Вы уже подали заявку на роль преподавателя. Статус:
          {{ getStatusText(application.status) }}
        </p>
      </div>

      <!-- Форма подачи заявки -->
      <div v-else>
        <UICard>
          <UICardHeader>
            <UICardTitle>Информация о заявке</UICardTitle>
            <UICardDescription>
              Если у вас есть опыт и знания, которыми вы хотите поделиться, станьте преподавателем и
              создавайте собственные курсы
            </UICardDescription>
          </UICardHeader>
          <UICardContent>
            <form @submit.prevent="onSubmit" class="space-y-6">
              <div class="space-y-2">
                <label :for="motivationInputId" class="text-sm font-medium">
                  Мотивация <span class="text-red-500">*</span>
                </label>
                <UITextarea
                  :id="motivationInputId"
                  v-model="motivation"
                  placeholder="Расскажите, почему вы хотите стать преподавателем..."
                  rows="4"
                  :error="errors.motivation"
                />
                <p v-if="errors.motivation" class="text-sm text-red-600">
                  {{ errors.motivation }}
                </p>
              </div>

              <div class="space-y-2">
                <label :for="experienceInputId" class="text-sm font-medium">
                  Опыт работы (необязательно)
                </label>
                <UITextarea
                  :id="experienceInputId"
                  v-model="experience"
                  placeholder="Опишите ваш профессиональный опыт..."
                  rows="3"
                />
              </div>

              <div class="space-y-2">
                <label :for="educationInputId" class="text-sm font-medium">
                  Образование (необязательно)
                </label>
                <UITextarea
                  :id="educationInputId"
                  v-model="education"
                  placeholder="Расскажите о вашем образовании..."
                  rows="3"
                />
              </div>

              <div v-if="error" class="text-sm font-medium text-red-600">
                {{ error }}
              </div>

              <div v-if="success" class="text-sm font-medium text-green-600">
                {{ success }}
              </div>

              <div class="flex justify-end space-x-4">
                <UIButton
                  type="button"
                  variant="outline"
                  @click="navigateTo('/app/settings')"
                  :disabled="loading"
                >
                  Отмена
                </UIButton>
                <UIButton type="submit" :disabled="loading">
                  <UISpinner v-if="loading" class="mr-2 h-4 w-4" />
                  Подать заявку
                </UIButton>
              </div>
            </form>
          </UICardContent>
        </UICard>
      </div>
    </div>
  </div>
</template>
