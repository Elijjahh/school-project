<script setup lang="ts">
import { BookOpen, Clock, Target, ChevronDown, ChevronUp } from 'lucide-vue-next';

interface TestAnalytics {
  testId: number;
  title: string;
  order: number;
  maxAttempts: number;
  totalStudents: number;
  studentsAttempted: number;
  studentsCompleted: number;
  studentsPassedRate: number;
  avgScore: number;
  avgAttempts: number;
  completionRate: number;
  passRate: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

interface LessonAnalytics {
  lessonId: number;
  title: string;
  order: number;
  totalStudents: number;
  studentsCompleted: number;
  completionRate: number;
  tests: TestAnalytics[];
  avgTestScore: number;
  hasTests: boolean;
}

interface ModuleAnalytics {
  moduleId: number;
  title: string;
  order: number;
  totalStudents: number;
  studentsCompleted: number;
  completionRate: number;
  lessons: LessonAnalytics[];
  avgLessonCompletion: number;
  avgTestScore: number;
  totalTests: number;
}

interface Props {
  module: ModuleAnalytics;
}

defineProps<Props>();

const isExpanded = ref(false);

const getProgressColor = (rate: number) => {
  if (rate >= 80) return 'bg-green-500';
  if (rate >= 60) return 'bg-blue-500';
  if (rate >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getDifficultyColor = (level: string) => {
  switch (level) {
    case 'easy':
      return 'text-green-600 bg-green-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'hard':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const getDifficultyLabel = (level: string) => {
  switch (level) {
    case 'easy':
      return 'Легкий';
    case 'medium':
      return 'Средний';
    case 'hard':
      return 'Сложный';
    default:
      return level;
  }
};
</script>

<template>
  <UICard class="p-6">
    <div class="space-y-4">
      <!-- Module Header -->
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900">{{ module.title }}</h3>
          <p class="text-sm text-gray-500">
            {{ module.lessons.length }} уроков • {{ module.totalTests }} тестов
          </p>
        </div>
        <UIButton variant="ghost" size="sm" @click="isExpanded = !isExpanded">
          <component :is="isExpanded ? ChevronUp : ChevronDown" class="h-4 w-4" />
        </UIButton>
      </div>

      <!-- Module Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="mb-2 flex items-center justify-center">
            <BookOpen class="h-5 w-5 text-blue-500" />
          </div>
          <p class="text-2xl font-semibold text-gray-900">{{ module.completionRate }}%</p>
          <p class="text-xs text-gray-500">Прохождение модуля</p>
        </div>
        <div class="text-center">
          <div class="mb-2 flex items-center justify-center">
            <Clock class="h-5 w-5 text-purple-500" />
          </div>
          <p class="text-2xl font-semibold text-gray-900">{{ module.avgLessonCompletion }}%</p>
          <p class="text-xs text-gray-500">Средний урок</p>
        </div>
        <div class="text-center">
          <div class="mb-2 flex items-center justify-center">
            <Target class="h-5 w-5 text-orange-500" />
          </div>
          <p class="text-2xl font-semibold text-gray-900">{{ module.avgTestScore }}%</p>
          <p class="text-xs text-gray-500">Средний балл</p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Прогресс</span>
          <span class="font-medium">{{ module.studentsCompleted }}/{{ module.totalStudents }}</span>
        </div>
        <div class="h-2 w-full rounded-full bg-gray-200">
          <div
            :class="getProgressColor(module.completionRate)"
            class="h-2 rounded-full transition-all duration-300"
            :style="{ width: `${module.completionRate}%` }"
          ></div>
        </div>
      </div>

      <!-- Lessons Details (Expanded) -->
      <div v-if="isExpanded" class="space-y-4 border-t pt-4">
        <h4 class="font-medium text-gray-900">Детализация по урокам</h4>

        <div class="space-y-3">
          <div
            v-for="lesson in module.lessons"
            :key="lesson.lessonId"
            class="rounded-lg border bg-gray-50 p-4"
          >
            <div class="mb-3 flex items-center justify-between">
              <div>
                <h5 class="font-medium text-gray-900">{{ lesson.title }}</h5>
                <p class="text-sm text-gray-500">
                  {{ lesson.tests.length > 0 ? `${lesson.tests.length} тестов` : 'Без тестов' }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-lg font-semibold text-gray-900">{{ lesson.completionRate }}%</p>
                <p class="text-xs text-gray-500">
                  {{ lesson.studentsCompleted }}/{{ lesson.totalStudents }}
                </p>
              </div>
            </div>

            <!-- Lesson Progress -->
            <div class="mb-3">
              <div class="h-1.5 w-full rounded-full bg-gray-200">
                <div
                  :class="getProgressColor(lesson.completionRate)"
                  class="h-1.5 rounded-full transition-all duration-300"
                  :style="{ width: `${lesson.completionRate}%` }"
                ></div>
              </div>
            </div>

            <!-- Tests in Lesson -->
            <div v-if="lesson.tests.length > 0" class="space-y-2">
              <h6 class="text-sm font-medium text-gray-700">Тесты:</h6>
              <div class="grid gap-2 sm:grid-cols-2">
                <div
                  v-for="test in lesson.tests"
                  :key="test.testId"
                  class="rounded border bg-white p-3"
                >
                  <div class="mb-2 flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900">{{ test.title }}</p>
                    <UIBadge :class="getDifficultyColor(test.difficultyLevel)" class="text-xs">
                      {{ getDifficultyLabel(test.difficultyLevel) }}
                    </UIBadge>
                  </div>

                  <div class="space-y-1 text-xs text-gray-600">
                    <div class="flex justify-between">
                      <span>Завершили:</span>
                      <span class="font-medium">{{ test.completionRate }}%</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Прошли:</span>
                      <span class="font-medium">{{ test.passRate }}%</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Средний балл:</span>
                      <span class="font-medium">{{ test.avgScore }}%</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Попыток в среднем:</span>
                      <span class="font-medium">{{ test.avgAttempts }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UICard>
</template>
