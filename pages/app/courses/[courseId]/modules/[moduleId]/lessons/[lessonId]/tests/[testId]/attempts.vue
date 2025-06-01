<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const route = useRoute();
const courseId = Number(route.params.courseId);
const moduleId = Number(route.params.moduleId);
const lessonId = Number(route.params.lessonId);
const testId = Number(route.params.testId);

const { data: courseData } = useFetch(`/api/courses/${courseId}`);
const { data: lessonData } = useFetch(`/api/lessons/${lessonId}`);
const { data: attemptsData } = useFetch(`/api/tests/${testId}/attempts`);

const attempts = computed(() => attemptsData.value?.attempts || []);

function formatDate(dateString: string | null) {
  if (!dateString) return 'Неизвестно';
  return new Date(dateString).toLocaleString('ru-RU');
}

function getScoreBadgeColor(score: number, total: number) {
  const percentage = (score / total) * 100;
  if (percentage >= 60) return 'bg-green-100 text-green-800';
  return 'bg-red-100 text-red-800';
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="space-y-8">
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
              <UIBreadcrumbLink
                :href="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`"
                >{{ lessonData?.title || 'Урок' }}</UIBreadcrumbLink
              >
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbPage>История попыток</UIBreadcrumbPage>
            </UIBreadcrumbItem>
          </UIBreadcrumbList>
        </UIBreadcrumb>

        <!-- Header -->
        <div class="space-y-2">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">История попыток</h1>
          <p class="text-gray-600">Все ваши попытки прохождения теста</p>
        </div>

        <!-- Attempts List -->
        <UICard v-if="attempts.length" class="p-6">
          <div class="space-y-4">
            <div
              v-for="(attempt, index) in attempts"
              :key="attempt.id"
              class="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-700"
                    >
                      #{{ attempts.length - index }}
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">
                      Попытка {{ attempts.length - index }}
                    </h3>
                    <p class="text-sm text-gray-500">{{ formatDate(attempt.datetime) }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div v-if="attempt.completed" class="text-right">
                    <div
                      class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                      :class="getScoreBadgeColor(attempt.score, attempt.totalQuestions)"
                    >
                      {{ Math.round((attempt.score / attempt.totalQuestions) * 100) }}%
                    </div>
                    <p class="mt-1 text-sm text-gray-500">
                      {{ attempt.score }} из {{ attempt.totalQuestions }}
                    </p>
                  </div>
                  <div v-else class="text-right">
                    <div
                      class="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800"
                    >
                      Не завершена
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UICard>

        <!-- No Attempts -->
        <UICard v-else class="p-8 text-center">
          <div class="mx-auto mb-4 h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 class="mb-2 text-lg font-medium text-gray-900">Нет попыток</h3>
          <p class="text-gray-500">Вы еще не проходили этот тест</p>
        </UICard>

        <!-- Navigation -->
        <div class="flex justify-between">
          <UIButton variant="outline">
            <NuxtLink :href="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`">
              ← Вернуться к уроку
            </NuxtLink>
          </UIButton>
          <UIButton>
            <NuxtLink
              :href="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/tests/${testId}`"
            >
              Пройти тест →
            </NuxtLink>
          </UIButton>
        </div>
      </div>
    </div>
  </div>
</template>
