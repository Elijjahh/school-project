<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const route = useRoute();
const courseId = Number(route.params.courseId);
const moduleId = Number(route.params.moduleId);
const lessonId = Number(route.params.lessonId);

const { data: lessonData, pending: loading } = useFetch(`/api/lessons/${lessonId}`);
const { data: courseData } = useFetch(`/api/courses/${courseId}`);
const { data: moduleData } = useFetch(`/api/modules/${moduleId}`);

const lesson = computed(() => lessonData.value);
const tests = computed(() => lesson.value?.tests || []);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="py-8 text-center">Загрузка...</div>
      <div v-else-if="lesson" class="space-y-8">
        <!-- Breadcrumbs -->
        <UIBreadcrumb>
          <UIBreadcrumbList>
            <UIBreadcrumbItem>
              <UIBreadcrumbLink href="/app/courses">Курсы</UIBreadcrumbLink>
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbLink :href="`/app/courses/${courseId}`">{{
                courseData?.title || 'Курс'
              }}</UIBreadcrumbLink>
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbPage>{{ lesson.title }}</UIBreadcrumbPage>
            </UIBreadcrumbItem>
          </UIBreadcrumbList>
        </UIBreadcrumb>

        <!-- Header -->
        <div class="space-y-2">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">{{ lesson.title }}</h1>
          <p class="text-gray-600">{{ moduleData?.title || 'Модуль' }}</p>
        </div>

        <!-- Lesson Content -->
        <UICard class="p-6">
          <!-- Video Section -->
          <div v-if="lesson.videoUrl" class="mb-8">
            <h2 class="mb-4 text-xl font-semibold text-gray-900">Видео урока</h2>
            <video
              :src="lesson.videoUrl"
              controls
              class="w-full max-w-4xl rounded-lg border shadow-sm"
              preload="metadata"
            >
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
          </div>

          <!-- Text Content -->
          <div class="prose max-w-none">
            <h2 class="mb-4 text-xl font-semibold text-gray-900">Материалы урока</h2>
            <div class="whitespace-pre-wrap text-gray-700">{{ lesson.content }}</div>
          </div>
        </UICard>

        <!-- Tests Section -->
        <UICard v-if="tests.length" class="p-6">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Тесты</h2>
            <p class="text-gray-600">Проверьте свои знания по этому уроку</p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="(test, index) in tests"
              :key="test.id"
              class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div class="flex items-start justify-between">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-700"
                >
                  T{{ index + 1 }}
                </div>
              </div>

              <div class="mt-4">
                <h3 class="font-semibold text-gray-900">Тест {{ index + 1 }}</h3>
                <div class="mt-2 space-y-1">
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {{ test.questions?.length || 0 }}
                    {{
                      (test.questions?.length || 0) === 1
                        ? 'вопрос'
                        : (test.questions?.length || 0) < 5
                          ? 'вопроса'
                          : 'вопросов'
                    }}
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    макс. {{ test.maxAttempts }}
                    {{
                      test.maxAttempts === 1
                        ? 'попытка'
                        : test.maxAttempts < 5
                          ? 'попытки'
                          : 'попыток'
                    }}
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <UIButton variant="default" size="sm" class="w-full">
                  <NuxtLink
                    :to="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/tests/${test.id}`"
                    class="flex w-full items-center justify-center gap-2"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Пройти тест
                  </NuxtLink>
                </UIButton>
              </div>
            </div>
          </div>
        </UICard>

        <!-- Navigation -->
        <div class="flex justify-between">
          <UIButton variant="outline">
            <NuxtLink :href="`/app/courses/${courseId}`"> ← Вернуться к курсу </NuxtLink>
          </UIButton>
        </div>
      </div>
      <div v-else class="py-8 text-center text-red-500">Урок не найден</div>
    </div>
  </div>
</template>
