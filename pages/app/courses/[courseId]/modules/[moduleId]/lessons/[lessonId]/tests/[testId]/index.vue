<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);
const moduleId = Number(route.params.moduleId);
const lessonId = Number(route.params.lessonId);
const testId = Number(route.params.testId);

const { data: courseData } = useFetch(`/api/courses/${courseId}`);
const { data: _moduleData } = useFetch(`/api/modules/${moduleId}`);
const { data: lessonData } = useFetch(`/api/lessons/${lessonId}`);

// Состояние теста
const currentQuestionIndex = ref(0);
const selectedAnswers = ref<{ [questionId: number]: number }>({});
const attemptId = ref<number | null>(null);
const questions = ref<Question[]>([]);
const loading = ref(false);
const testStarted = ref(false);
const testCompleted = ref(false);
const testResult = ref<TestResult | null>(null);
const error = ref('');

interface Question {
  id: number;
  text: string;
  answers: Answer[];
}

interface Answer {
  id: number;
  text: string;
}

interface TestResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
}

// Текущий вопрос
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
const totalQuestions = computed(() => questions.value.length);
const canGoNext = computed(() => selectedAnswers.value[currentQuestion.value?.id]);
const canGoPrevious = computed(() => currentQuestionIndex.value > 0);
const isLastQuestion = computed(() => currentQuestionIndex.value === totalQuestions.value - 1);

// Начать тест
async function startTest() {
  try {
    loading.value = true;
    error.value = '';

    // Начинаем тест
    const startResponse = await $fetch(`/api/tests/${testId}/start`, {
      method: 'POST',
    });

    attemptId.value = startResponse.attemptId;

    // Получаем вопросы
    const questionsResponse = await $fetch(`/api/tests/${testId}/questions`);
    questions.value = questionsResponse.questions;

    testStarted.value = true;
  } catch (err: unknown) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message || 'Ошибка при начале теста';
  } finally {
    loading.value = false;
  }
}

// Выбрать ответ
function selectAnswer(answerId: number) {
  if (!currentQuestion.value) return;
  selectedAnswers.value[currentQuestion.value.id] = answerId;
}

// Следующий вопрос
async function nextQuestion() {
  if (!canGoNext.value || !attemptId.value || !currentQuestion.value) return;

  try {
    loading.value = true;

    // Отправляем ответ
    await $fetch(`/api/tests/attempts/${attemptId.value}/answer`, {
      method: 'POST',
      body: {
        questionId: currentQuestion.value.id,
        selectedAnswerId: selectedAnswers.value[currentQuestion.value.id],
      },
    });

    if (isLastQuestion.value) {
      // Завершаем тест
      await completeTest();
    } else {
      // Переходим к следующему вопросу
      currentQuestionIndex.value++;
    }
  } catch (err: unknown) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message || 'Ошибка при отправке ответа';
  } finally {
    loading.value = false;
  }
}

// Предыдущий вопрос
function previousQuestion() {
  if (canGoPrevious.value) {
    currentQuestionIndex.value--;
  }
}

// Завершить тест
async function completeTest() {
  if (!attemptId.value) return;

  try {
    loading.value = true;

    const result = await $fetch(`/api/tests/attempts/${attemptId.value}/complete`, {
      method: 'POST',
    });

    testResult.value = result;
    testCompleted.value = true;
  } catch (err: unknown) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message || 'Ошибка при завершении теста';
  } finally {
    loading.value = false;
  }
}

// Вернуться к уроку
function returnToLesson() {
  router.push(`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
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
              <UIBreadcrumbPage>Тест</UIBreadcrumbPage>
            </UIBreadcrumbItem>
          </UIBreadcrumbList>
        </UIBreadcrumb>

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

        <!-- Не начатый тест -->
        <div v-if="!testStarted && !testCompleted" class="text-center">
          <UICard class="mx-auto max-w-lg p-8">
            <h1 class="mb-4 text-2xl font-bold text-gray-900">Готовы начать тест?</h1>
            <p class="mb-6 text-gray-600">
              Тест содержит несколько вопросов. Каждый вопрос будет показан отдельно. После начала
              вы не сможете вернуться к предыдущим вопросам.
            </p>
            <UIButton @click="startTest" :disabled="loading" size="lg" class="w-full">
              <svg
                v-if="loading"
                class="mr-2 h-4 w-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {{ loading ? 'Загрузка...' : 'Начать тест' }}
            </UIButton>
          </UICard>
        </div>

        <!-- Процесс прохождения теста -->
        <div v-if="testStarted && !testCompleted" class="space-y-6">
          <!-- Прогресс -->
          <UICard class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">
                  Вопрос {{ currentQuestionIndex + 1 }} из {{ totalQuestions }}
                </p>
                <div class="mt-1 h-2 w-64 rounded-full bg-gray-200">
                  <div
                    class="bg-primary h-2 rounded-full transition-all"
                    :style="{
                      width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </UICard>

          <!-- Вопрос -->
          <UICard v-if="currentQuestion" class="p-6">
            <h2 class="mb-6 text-xl font-semibold text-gray-900">
              {{ currentQuestion.text }}
            </h2>

            <div class="space-y-3">
              <div
                v-for="answer in currentQuestion.answers"
                :key="answer.id"
                class="hover:border-primary/30 hover:bg-primary/5 cursor-pointer rounded-lg border p-4 transition-all"
                :class="{
                  'border-primary bg-primary/10': selectedAnswers[currentQuestion.id] === answer.id,
                  'border-gray-200': selectedAnswers[currentQuestion.id] !== answer.id,
                }"
                @click="selectAnswer(answer.id)"
              >
                <div class="flex items-center">
                  <div
                    class="mr-3 h-4 w-4 rounded-full border-2 transition-all"
                    :class="{
                      'border-primary bg-primary':
                        selectedAnswers[currentQuestion.id] === answer.id,
                      'border-gray-300': selectedAnswers[currentQuestion.id] !== answer.id,
                    }"
                  >
                    <div
                      v-if="selectedAnswers[currentQuestion.id] === answer.id"
                      class="h-full w-full rounded-full bg-white"
                      style="transform: scale(0.5)"
                    ></div>
                  </div>
                  <span class="text-gray-700">{{ answer.text }}</span>
                </div>
              </div>
            </div>

            <!-- Навигация -->
            <div class="mt-8 flex justify-between">
              <UIButton
                variant="outline"
                @click="previousQuestion"
                :disabled="!canGoPrevious || loading"
              >
                ← Назад
              </UIButton>
              <UIButton @click="nextQuestion" :disabled="!canGoNext || loading">
                <svg
                  v-if="loading"
                  class="mr-2 h-4 w-4 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {{ loading ? 'Загрузка...' : isLastQuestion ? 'Завершить тест' : 'Далее →' }}
              </UIButton>
            </div>
          </UICard>
        </div>

        <!-- Результаты теста -->
        <div v-if="testCompleted" class="text-center">
          <UICard class="mx-auto max-w-lg p-8">
            <div class="mb-6">
              <div
                class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                :class="{
                  'bg-green-100 text-green-600': testResult?.passed,
                  'bg-red-100 text-red-600': !testResult?.passed,
                }"
              >
                <svg
                  v-if="testResult?.passed"
                  class="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg v-else class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ testResult?.passed ? 'Тест пройден!' : 'Тест не пройден' }}
              </h1>
            </div>

            <div class="mb-6 space-y-4">
              <div class="text-center">
                <p class="text-3xl font-bold text-gray-900">{{ testResult?.percentage }}%</p>
                <p class="text-gray-600">
                  {{ testResult?.score }} из {{ testResult?.totalQuestions }} правильных ответов
                </p>
              </div>

              <div
                class="rounded-lg p-4"
                :class="{
                  'bg-green-50': testResult?.passed,
                  'bg-red-50': !testResult?.passed,
                }"
              >
                <p
                  class="text-sm"
                  :class="{
                    'text-green-800': testResult?.passed,
                    'text-red-800': !testResult?.passed,
                  }"
                >
                  {{
                    testResult?.passed
                      ? 'Поздравляем! Вы успешно прошли тест.'
                      : 'К сожалению, тест не пройден. Попробуйте еще раз после изучения материала.'
                  }}
                </p>
              </div>
            </div>

            <UIButton @click="returnToLesson" size="lg" class="w-full">
              Вернуться к уроку
            </UIButton>
          </UICard>
        </div>
      </div>
    </div>
  </div>
</template>
