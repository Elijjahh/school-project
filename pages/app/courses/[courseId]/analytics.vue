<script setup lang="ts">
import { BarChart3 } from 'lucide-vue-next';

definePageMeta({
  layout: 'profile',
});

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

interface ContentAnalyticsData {
  courseId: number;
  courseTitle: string;
  totalStudents: number;
  modules: ModuleAnalytics[];
  summary: {
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
  };
}

const { user } = useUserSession();
const route = useRoute();
const courseId = Number(route.params.courseId);

if (!user.value?.id) {
  throw createError({
    statusCode: 401,
    statusMessage: 'Unauthorized',
  });
}

// Получаем данные курса
const { data: courseData } = await useFetch(`/api/courses/${courseId}`);

// Проверяем, что пользователь является создателем курса
if (!courseData.value || courseData.value.creator.id !== user.value.id) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Access denied',
  });
}

// Получаем аналитику по содержанию курса
const {
  data: analytics,
  pending,
  error,
  refresh,
} = await useFetch<ContentAnalyticsData>(`/api/courses/${courseId}/content-analytics`);

// Состояние фильтров и сортировки
const sortBy = ref<'order' | 'completion' | 'difficulty'>('order');
const sortOrder = ref<'asc' | 'desc'>('asc');
const showOnlyProblematic = ref(false);

// Фильтрованные и отсортированные модули
const filteredModules = computed(() => {
  if (!analytics.value?.modules) return [];

  let filtered = [...analytics.value.modules];

  // Фильтрация проблематичного контента
  if (showOnlyProblematic.value) {
    filtered = filtered.filter((module) => module.completionRate < 70);
  }

  // Сортировка
  filtered.sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy.value) {
      case 'completion':
        aValue = a.completionRate;
        bValue = b.completionRate;
        break;
      case 'difficulty':
        // Сложность определяется обратно пропорционально проценту прохождения
        aValue = 100 - a.completionRate;
        bValue = 100 - b.completionRate;
        break;
      case 'order':
      default:
        aValue = a.order;
        bValue = b.order;
        break;
    }

    return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue;
  });

  return filtered;
});
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
              <UIBreadcrumbPage>Аналитика</UIBreadcrumbPage>
            </UIBreadcrumbItem>
          </UIBreadcrumbList>
        </UIBreadcrumb>

        <!-- Header -->
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <BarChart3 class="h-8 w-8 text-blue-600" />
            <h1 class="text-3xl font-bold tracking-tight text-gray-900">Аналитика курса</h1>
          </div>
          <p class="text-gray-600">{{ courseData?.title || 'Курс' }}</p>
          <p class="text-sm text-gray-500">
            Анализ эффективности материалов курса и их прохождения
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="pending" class="flex justify-center py-8">
          <UISpinner size="lg" />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="py-8 text-center">
          <p class="text-red-600">{{ error.message }}</p>
          <UIButton @click="refresh" class="mt-4">Попробовать снова</UIButton>
        </div>

        <!-- Analytics Content -->
        <div v-else-if="analytics" class="space-y-8">
          <!-- Summary -->
          <AnalyticsContentSummary
            :summary="analytics.summary"
            :total-students="analytics.totalStudents"
          />

          <!-- Controls -->
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <!-- Filters -->
            <div class="flex items-center gap-4">
              <div class="flex items-center space-x-2">
                <input
                  id="problematic"
                  v-model="showOnlyProblematic"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="problematic" class="text-sm text-gray-700">
                  Только проблематичный контент (&lt;70%)
                </label>
              </div>
            </div>

            <!-- Sort Controls -->
            <div class="flex items-center gap-4">
              <UISelect v-model="sortBy">
                <option value="order">По порядку</option>
                <option value="completion">По проценту прохождения</option>
                <option value="difficulty">По сложности</option>
              </UISelect>

              <UIButton
                variant="outline"
                size="sm"
                @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
              >
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </UIButton>
            </div>
          </div>

          <!-- Modules Grid -->
          <div class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-900">
              Модули курса
              <span v-if="showOnlyProblematic" class="text-lg font-normal text-gray-600">
                (проблематичные)
              </span>
            </h2>

            <div v-if="filteredModules.length === 0" class="py-12 text-center">
              <BarChart3 class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">
                {{ showOnlyProblematic ? 'Проблематичный контент не найден' : 'Модули не найдены' }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{
                  showOnlyProblematic
                    ? 'Все модули имеют хорошие показатели прохождения'
                    : 'В курсе пока нет модулей'
                }}
              </p>
            </div>

            <div v-else class="space-y-6">
              <AnalyticsModuleCard
                v-for="module in filteredModules"
                :key="module.moduleId"
                :module="module"
              />
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex flex-wrap gap-4 border-t pt-6">
            <UIButton variant="outline" @click="refresh"> Обновить данные </UIButton>

            <NuxtLink :to="`/app/courses/${courseId}`">
              <UIButton variant="outline"> Вернуться к курсу </UIButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
