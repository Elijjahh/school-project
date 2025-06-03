<script setup lang="ts">
interface TestProgress {
  testId: number;
  maxAttempts: number;
  attemptsCount: number;
  completedAttempts: number;
  bestScore: number;
  bestPercentage: number;
  passed: boolean;
  lastAttemptAt: string | null;
}

interface LessonProgress {
  lessonId: number;
  title: string;
  order: number;
  completed: boolean;
  tests: TestProgress[];
}

interface Module {
  moduleId: number;
  title: string;
  order: number;
  completed: boolean;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  lessons: LessonProgress[];
}

interface CourseProgressData {
  courseId: number;
  courseCompleted: boolean;
  overallProgress: number;
  totalModules: number;
  completedModules: number;
  totalLessons: number;
  completedLessons: number;
  modules: Module[];
}

interface Props {
  courseId: number;
  userId: number;
  showDetails?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false,
});

const {
  data: progressData,
  pending,
  refresh,
} = useFetch<CourseProgressData>(`/api/courses/${props.courseId}/progress?userId=${props.userId}`);

// Функция для обновления прогресса
const updateProgress = () => {
  refresh();
};

// Экспортируем функцию для внешнего вызова
defineExpose({
  updateProgress,
});

function getProgressColor(progress: number) {
  if (progress === 100) return 'bg-green-500';
  if (progress >= 60) return 'bg-blue-500';
  if (progress >= 30) return 'bg-yellow-500';
  return 'bg-gray-300';
}

function getProgressText(progress: number) {
  return `${Math.round(progress)}%`;
}

function getTestStatusColor(test: TestProgress) {
  if (test.passed) return 'text-green-600';
  if (test.attemptsCount >= test.maxAttempts) return 'text-red-600';
  if (test.attemptsCount > 0) return 'text-yellow-600';
  return 'text-gray-500';
}

function getTestStatusText(test: TestProgress) {
  if (test.passed) return 'Пройден';
  if (test.attemptsCount >= test.maxAttempts) return 'Не пройден';
  if (test.attemptsCount > 0) return 'В процессе';
  return 'Не начат';
}
</script>

<template>
  <div class="space-y-4">
    <!-- Общий прогресс курса -->
    <div v-if="progressData" class="rounded-lg border bg-white p-4">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Прогресс курса</h3>
        <span
          :class="
            progressData.courseCompleted
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          "
          class="rounded-full px-2 py-1 text-xs font-medium"
        >
          {{ progressData.courseCompleted ? 'Завершен' : 'В процессе' }}
        </span>
      </div>

      <!-- Прогресс-бар -->
      <div class="mb-4">
        <div class="mb-1 flex justify-between text-sm text-gray-600">
          <span>Общий прогресс</span>
          <span>{{ getProgressText(progressData.overallProgress) }}</span>
        </div>
        <div class="h-2 w-full rounded-full bg-gray-200">
          <div
            :class="getProgressColor(progressData.overallProgress)"
            class="h-2 rounded-full transition-all duration-300"
            :style="{ width: `${progressData.overallProgress}%` }"
          ></div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="text-center">
          <div class="font-semibold text-gray-900">
            {{ progressData.completedModules }}/{{ progressData.totalModules }}
          </div>
          <div class="text-gray-600">Модули</div>
        </div>
        <div class="text-center">
          <div class="font-semibold text-gray-900">
            {{ progressData.completedLessons }}/{{ progressData.totalLessons }}
          </div>
          <div class="text-gray-600">Уроки</div>
        </div>
      </div>
    </div>

    <!-- Детальный прогресс по модулям -->
    <div v-if="showDetails && progressData" class="space-y-3">
      <h4 class="text-md font-semibold text-gray-900">Прогресс по модулям</h4>

      <div
        v-for="module in progressData.modules"
        :key="module.moduleId"
        class="rounded-lg border bg-white p-4"
      >
        <div class="mb-2 flex items-center justify-between">
          <h5 class="font-medium text-gray-900">{{ module.title }}</h5>
          <span
            :class="module.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
            class="rounded-full px-2 py-1 text-xs font-medium"
          >
            {{ module.completed ? 'Завершен' : 'В процессе' }}
          </span>
        </div>

        <!-- Прогресс модуля -->
        <div class="mb-3">
          <div class="mb-1 flex justify-between text-sm text-gray-600">
            <span>{{ module.completedLessons }}/{{ module.totalLessons }} уроков</span>
            <span>{{ getProgressText(module.progress) }}</span>
          </div>
          <div class="h-1.5 w-full rounded-full bg-gray-200">
            <div
              :class="getProgressColor(module.progress)"
              class="h-1.5 rounded-full transition-all duration-300"
              :style="{ width: `${module.progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Список уроков -->
        <div class="space-y-1">
          <div v-for="lesson in module.lessons" :key="lesson.lessonId" class="text-sm">
            <div class="flex items-center">
              <div
                :class="lesson.completed ? 'bg-green-500' : 'bg-gray-300'"
                class="mr-2 h-2 w-2 rounded-full"
              ></div>
              <span :class="lesson.completed ? 'text-gray-900' : 'text-gray-600'">
                {{ lesson.title }}
              </span>
            </div>

            <!-- Тесты урока -->
            <div v-if="lesson.tests.length > 0" class="mt-1 ml-4 space-y-1">
              <div
                v-for="test in lesson.tests"
                :key="test.testId"
                class="flex items-center justify-between rounded bg-gray-50 px-2 py-1 text-xs"
              >
                <div class="flex items-center gap-2">
                  <div
                    :class="
                      test.passed
                        ? 'bg-green-500'
                        : test.attemptsCount > 0
                          ? 'bg-yellow-500'
                          : 'bg-gray-300'
                    "
                    class="h-1.5 w-1.5 rounded-full"
                  ></div>
                  <span>Тест</span>
                </div>
                <div class="flex items-center gap-2">
                  <span :class="getTestStatusColor(test)" class="font-medium">
                    {{ getTestStatusText(test) }}
                  </span>
                  <span v-if="test.attemptsCount > 0" class="text-gray-500">
                    {{ test.bestPercentage }}% ({{ test.attemptsCount }}/{{ test.maxAttempts }})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="pending" class="rounded-lg border bg-white p-4">
      <div class="animate-pulse space-y-3">
        <div class="h-4 w-1/3 rounded bg-gray-200"></div>
        <div class="h-2 rounded bg-gray-200"></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="h-8 rounded bg-gray-200"></div>
          <div class="h-8 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>

    <!-- Состояние ошибки -->
    <div v-if="!pending && !progressData" class="rounded-lg border bg-white p-4">
      <div class="text-center text-gray-500">
        <p>Не удалось загрузить прогресс курса</p>
        <UIButton @click="refresh" variant="outline" size="sm" class="mt-2">
          Попробовать снова
        </UIButton>
      </div>
    </div>
  </div>
</template>
