<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const route = useRoute();
const courseId = Number(route.params.courseId);
const moduleId = Number(route.params.moduleId);
const lessonId = Number(route.params.lessonId);
const testId = Number(route.params.testId);

const { data: testData, pending: loading, refresh } = useFetch(`/api/tests/${testId}`);
const { data: courseData } = useFetch(`/api/courses/${courseId}`);
const { data: moduleData } = useFetch(`/api/modules/${moduleId}`);
const { data: lessonData } = useFetch(`/api/lessons/${lessonId}`);

const error = ref('');

async function handleTestSave(payload: {
  maxAttempts: number;
  testQuestions: Array<{ text: string; answers: Array<{ text: string; correct: boolean }> }>;
}) {
  if (!testData.value) return;
  try {
    await fetch(`/api/tests/${testId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxAttempts: payload.maxAttempts,
        testQuestions: payload.testQuestions,
      }),
    });
    await refresh();
  } catch {
    error.value = 'Ошибка при сохранении теста';
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="py-8 text-center">Загрузка...</div>
      <div v-else class="space-y-8">
        <!-- Breadcrumbs -->
        <UIBreadcrumb>
          <UIBreadcrumbList>
            <UIBreadcrumbItem>
              <UIBreadcrumbLink href="/app/my-courses">Мои курсы</UIBreadcrumbLink>
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbLink :href="`/app/courses/${courseId}`">{{
                courseData?.title || 'Курс'
              }}</UIBreadcrumbLink>
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbLink :href="`/app/courses/${courseId}/modules/${moduleId}/edit`">{{
                moduleData?.title || 'Модуль'
              }}</UIBreadcrumbLink>
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbLink
                :href="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/edit`"
                >{{ lessonData?.title || 'Урок' }}</UIBreadcrumbLink
              >
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbPage>Тест</UIBreadcrumbPage>
            </UIBreadcrumbItem>
          </UIBreadcrumbList>
        </UIBreadcrumb>

        <!-- Header -->
        <div class="space-y-2">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">Редактировать тест</h1>
          <p class="text-gray-600">Измените настройки теста и его вопросы</p>
        </div>

        <!-- Test Edit Form -->
        <TestEditForm v-if="testData" :test="testData" :loading="loading" @save="handleTestSave" />

        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
