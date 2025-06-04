<script setup lang="ts">
import { BookOpen, Users, ClipboardCheck, Target, TrendingDown, TrendingUp } from 'lucide-vue-next';

interface ContentSummary {
  totalModules: number;
  totalLessons: number;
  totalTests: number;
  avgModuleCompletion: number;
  avgLessonCompletion: number;
  avgTestCompletion: number;
  avgTestScore: number;
  mostDifficultContent: {
    type: 'module' | 'lesson' | 'test';
    id: number;
    title: string;
    completionRate: number;
  };
  easiestContent: {
    type: 'module' | 'lesson' | 'test';
    id: number;
    title: string;
    completionRate: number;
  };
}

interface Props {
  summary: ContentSummary;
  totalStudents: number;
}

const props = defineProps<Props>();

const summaryStats = computed(() => [
  {
    label: 'Участников курса',
    value: props.totalStudents,
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    label: 'Прогресс по модулям',
    value: `${props.summary.avgModuleCompletion}%`,
    icon: BookOpen,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    label: 'Прогресс по урокам',
    value: `${props.summary.avgLessonCompletion}%`,
    icon: ClipboardCheck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    label: 'Средний результат тестов',
    value: `${props.summary.avgTestScore}%`,
    icon: Target,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
]);

const getContentTypeLabel = (type: string) => {
  switch (type) {
    case 'module':
      return 'Модуль';
    case 'lesson':
      return 'Урок';
    case 'test':
      return 'Тест';
    default:
      return type;
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Main Stats -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in summaryStats"
        :key="stat.label"
        class="rounded-lg border bg-white p-6 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">{{ stat.label }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
          </div>
          <div :class="[stat.bgColor, stat.color]" class="rounded-lg p-3">
            <component :is="stat.icon" class="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>

    <!-- Content Overview -->
    <div class="grid gap-6 md:grid-cols-3">
      <!-- Content Structure -->
      <UICard class="p-6">
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Структура курса</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Модули</span>
              <span class="font-medium">{{ summary.totalModules }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Уроки</span>
              <span class="font-medium">{{ summary.totalLessons }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Тесты</span>
              <span class="font-medium">{{ summary.totalTests }}</span>
            </div>
          </div>
        </div>
      </UICard>

      <!-- Most Difficult Content -->
      <UICard class="p-6">
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <TrendingDown class="h-5 w-5 text-red-500" />
            <h3 class="text-lg font-semibold text-gray-900">Сложный материал</h3>
          </div>
          <div class="space-y-2">
            <p class="text-sm text-gray-600">
              {{ getContentTypeLabel(summary.mostDifficultContent.type) }}
            </p>
            <p class="font-medium text-gray-900">{{ summary.mostDifficultContent.title }}</p>
            <div class="flex items-center gap-2">
              <div class="h-2 w-full rounded-full bg-gray-200">
                <div
                  class="h-2 rounded-full bg-red-500 transition-all duration-300"
                  :style="{ width: `${summary.mostDifficultContent.completionRate}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-red-600">
                {{ summary.mostDifficultContent.completionRate }}%
              </span>
            </div>
          </div>
        </div>
      </UICard>

      <!-- Easiest Content -->
      <UICard class="p-6">
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <TrendingUp class="h-5 w-5 text-green-500" />
            <h3 class="text-lg font-semibold text-gray-900">Простой материал</h3>
          </div>
          <div class="space-y-2">
            <p class="text-sm text-gray-600">
              {{ getContentTypeLabel(summary.easiestContent.type) }}
            </p>
            <p class="font-medium text-gray-900">{{ summary.easiestContent.title }}</p>
            <div class="flex items-center gap-2">
              <div class="h-2 w-full rounded-full bg-gray-200">
                <div
                  class="h-2 rounded-full bg-green-500 transition-all duration-300"
                  :style="{ width: `${summary.easiestContent.completionRate}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-green-600">
                {{ summary.easiestContent.completionRate }}%
              </span>
            </div>
          </div>
        </div>
      </UICard>
    </div>
  </div>
</template>
