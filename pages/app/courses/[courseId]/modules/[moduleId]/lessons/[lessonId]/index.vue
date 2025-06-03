<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const { user } = useUserSession();
const route = useRoute();
const courseId = Number(route.params.courseId);
const moduleId = Number(route.params.moduleId);
const lessonId = Number(route.params.lessonId);

const { data: lessonData, pending: loading } = useFetch(`/api/lessons/${lessonId}`);
const { data: courseData } = useFetch(`/api/courses/${courseId}`);
const { data: moduleData } = useFetch(`/api/modules/${moduleId}`);

const lesson = computed(() => lessonData.value);
const tests = computed(() => lesson.value?.tests || []);

// Ссылки на компоненты прогресса
const lessonProgressRef = ref();

// Обработчик обновления прогресса урока
const handleProgressUpdated = () => {
  // Логика для обновления прогресса (если нужно)
};
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
        <div class="space-y-4">
          <div class="space-y-2">
            <h1 class="text-3xl font-bold tracking-tight text-gray-900">{{ lesson.title }}</h1>
            <p class="text-gray-600">{{ moduleData?.title || 'Модуль' }}</p>
          </div>

          <!-- Lesson Progress and Course Progress Link -->
          <div class="flex items-center justify-between">
            <LessonProgress
              v-if="user?.id"
              ref="lessonProgressRef"
              :lessonId="lessonId"
              :userId="user.id"
              :autoMarkCompleted="!tests.length"
              @progressUpdated="handleProgressUpdated"
            />

            <UIButton v-if="user?.id" variant="outline" size="sm">
              <NuxtLink :to="`/app/courses/${courseId}/progress`" class="flex items-center gap-2">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Прогресс курса
              </NuxtLink>
            </UIButton>
          </div>
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
            <TestCard
              v-for="(test, index) in tests"
              :key="test.id"
              :test="test"
              :index="index"
              :course-id="courseId"
              :module-id="moduleId"
              :lesson-id="lessonId"
            />
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
