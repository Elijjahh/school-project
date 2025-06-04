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

// Получаем прогресс урока
const { data: lessonProgress, refresh: refreshLessonProgress } = await useFetch(
  `/api/courses/${courseId}/progress`,
  {
    query: computed(() => (user.value?.id ? { userId: user.value.id } : {})),
    default: () => null,
    server: false,
  },
);

const lesson = computed(() => lessonData.value);
const tests = computed(() => lesson.value?.tests || []);

// Проверяем, завершен ли текущий урок
const isLessonCompleted = computed(() => {
  if (!lessonProgress.value?.modules) return false;

  for (const module of lessonProgress.value.modules) {
    const lessonData = module.lessons?.find((l) => l.lessonId === lessonId);
    if (lessonData) return lessonData.completed;
  }
  return false;
});

// Ссылки на компоненты прогресса
const lessonProgressRef = ref();

// Обработчик обновления прогресса урока
const handleProgressUpdated = () => {
  // Обновляем данные о прогрессе
  refreshLessonProgress();
};

// Обновляем прогресс при монтировании и при фокусе на страницу
onMounted(() => {
  // Обновляем прогресс при возврате на страницу
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      refreshLessonProgress();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Очищаем слушатель при размонтировании
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  });
});

// Также обновляем прогресс при навигации
watch(
  () => route.fullPath,
  () => {
    // Небольшая задержка для завершения навигации
    setTimeout(() => {
      refreshLessonProgress();
    }, 100);
  },
);
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
          <div class="flex items-center justify-start">
            <!-- Таймер для уроков без тестов (только если урок не завершен) -->
            <LessonProgress
              v-if="user?.id && !tests.length && !isLessonCompleted"
              ref="lessonProgressRef"
              :lesson-id="lessonId"
              :user-id="user.id"
              :auto-mark-completed="!tests.length"
              @progress-updated="handleProgressUpdated"
            />

            <!-- Информация для уроков с тестами (если урок не завершен) -->
            <div
              v-else-if="user?.id && tests.length && !isLessonCompleted"
              class="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3"
            >
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-blue-500"></div>
                <span class="text-sm font-medium text-blue-800">
                  Для завершения урока пройдите тест ниже
                </span>
              </div>
            </div>

            <!-- Сообщение о завершении урока -->
            <div
              v-else-if="user?.id && isLessonCompleted"
              class="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3"
            >
              <div class="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                <svg
                  class="h-3 w-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span class="text-sm font-medium text-green-800">Урок завершен</span>
            </div>
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
