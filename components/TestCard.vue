<script setup lang="ts">
interface Test {
  id: number;
  maxAttempts: number;
  questions?: { length: number };
}

interface TestAttempt {
  id: number;
  score: number;
  totalQuestions: number;
  completed: boolean;
  datetime: string | null;
  testId: number;
  userId: number;
}

interface Props {
  test: Test;
  index: number;
  courseId: number;
  moduleId: number;
  lessonId: number;
}

const props = defineProps<Props>();

// Получаем попытки пользователя для этого теста
const { data: attemptsData } = useFetch(`/api/tests/${props.test.id}/attempts`);

const attempts = computed(() => attemptsData.value?.attempts || []);
const totalAttempts = computed(() => attemptsData.value?.totalAttempts || 0);
const lastAttempt = computed(() => attempts.value[0] as TestAttempt | undefined);
const canTakeTest = computed(() => {
  if (props.test.maxAttempts === 0) return true; // Неограниченные попытки
  return totalAttempts.value < props.test.maxAttempts;
});

const bestScore = computed(() => {
  if (!attempts.value.length) return null;
  const completedAttempts = attempts.value.filter((attempt: TestAttempt) => attempt.completed);
  if (!completedAttempts.length) return null;

  const best = completedAttempts.reduce((best: TestAttempt, current: TestAttempt) =>
    current.score > best.score ? current : best,
  );

  return {
    score: best.score,
    totalQuestions: best.totalQuestions,
    percentage: Math.round((best.score / best.totalQuestions) * 100),
    passed: best.score >= Math.ceil(best.totalQuestions * 0.6),
  };
});
</script>

<template>
  <div
    class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
  >
    <div class="flex items-start justify-between">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-700"
      >
        T{{ index + 1 }}
      </div>
      <div v-if="bestScore" class="text-right">
        <div
          class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
          :class="{
            'bg-green-100 text-green-800': bestScore.passed,
            'bg-red-100 text-red-800': !bestScore.passed,
          }"
        >
          {{ bestScore.percentage }}%
        </div>
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
          {{ totalAttempts }} / {{ test.maxAttempts === 0 ? '∞' : test.maxAttempts }}
          {{ totalAttempts === 1 ? 'попытка' : totalAttempts < 5 ? 'попытки' : 'попыток' }}
        </div>
        <div
          v-if="lastAttempt && lastAttempt.completed"
          class="flex items-center gap-2 text-sm text-gray-600"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Последний результат: {{ lastAttempt.score }}/{{ lastAttempt.totalQuestions }}
        </div>
      </div>
    </div>

    <div class="mt-4 space-y-2">
      <UIButton
        :variant="canTakeTest ? 'default' : 'outline'"
        size="sm"
        class="w-full"
        :disabled="!canTakeTest"
      >
        <NuxtLink
          v-if="canTakeTest"
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
          {{ totalAttempts > 0 ? 'Пройти еще раз' : 'Пройти тест' }}
        </NuxtLink>
        <span v-else class="flex w-full items-center justify-center gap-2">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          Попытки исчерпаны
        </span>
      </UIButton>

      <UIButton v-if="totalAttempts > 0" variant="outline" size="sm" class="w-full">
        <NuxtLink
          :to="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/tests/${test.id}/attempts`"
          class="flex w-full items-center justify-center gap-2"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          История попыток
        </NuxtLink>
      </UIButton>
    </div>
  </div>
</template>
