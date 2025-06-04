<script setup lang="ts">
import { CheckCircle, Users, BookOpen, BarChart3, Clock } from 'lucide-vue-next';

definePageMeta({
  layout: 'profile',
});

interface StudentProgress {
  participationId: number;
  userId: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  fullName: string;
  progress: {
    courseCompleted: boolean;
    completedLessons: number;
    totalLessons: number;
    completedModules: number;
    totalModules: number;
    overallProgress: number;
    testsStats: {
      totalTests: number;
      passedTests: number;
      totalAttempts: number;
      avgScore: number;
      passRate: number;
    };
  };
}

interface AnalyticsData {
  courseId: number;
  courseTitle: string;
  students: StudentProgress[];
  totalStudents: number;
  summary: {
    totalModules: number;
    totalLessons: number;
    totalTests: number;
    avgProgress: number;
    completedStudents: number;
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

// Получаем аналитику по студентам
const {
  data: analytics,
  pending,
  error,
  refresh,
} = await useFetch<AnalyticsData>(`/api/courses/${courseId}/students-progress`);

// Вычисляемые свойства для отображения статистики
const summaryStats = computed(() => {
  if (!analytics.value) return [];

  const { summary, totalStudents } = analytics.value;

  return [
    {
      label: 'Всего студентов',
      value: totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Завершили курс',
      value: `${summary.completedStudents}/${totalStudents}`,
      percentage:
        totalStudents > 0 ? Math.round((summary.completedStudents / totalStudents) * 100) : 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Средний прогресс',
      value: `${summary.avgProgress}%`,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Всего уроков',
      value: summary.totalLessons,
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];
});

// Фильтрация и сортировка
const searchQuery = ref('');
const sortBy = ref<'progress' | 'name' | 'tests'>('progress');
const sortOrder = ref<'asc' | 'desc'>('desc');

const filteredStudents = computed(() => {
  if (!analytics.value?.students) return [];

  const filtered = analytics.value.students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.username.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );

  // Сортировка
  filtered.sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy.value) {
      case 'progress':
        aValue = a.progress.overallProgress;
        bValue = b.progress.overallProgress;
        break;
      case 'name':
        return sortOrder.value === 'asc'
          ? a.fullName.localeCompare(b.fullName)
          : b.fullName.localeCompare(a.fullName);
      case 'tests':
        aValue = a.progress.testsStats.avgScore;
        bValue = b.progress.testsStats.avgScore;
        break;
      default:
        return 0;
    }

    return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue;
  });

  return filtered;
});

const getProgressColor = (progress: number) => {
  if (progress >= 90) return 'bg-green-500';
  if (progress >= 70) return 'bg-blue-500';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 30) return 'bg-orange-500';
  return 'bg-red-500';
};

const getTestScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};
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
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">Аналитика курса</h1>
          <p class="text-gray-600">{{ courseData?.title || 'Курс' }}</p>
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
          <!-- Summary Stats -->
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
                  <p v-if="stat.percentage !== undefined" class="text-sm text-gray-500">
                    {{ stat.percentage }}%
                  </p>
                </div>
                <div :class="[stat.bgColor, stat.color]" class="rounded-lg p-3">
                  <component :is="stat.icon" class="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <!-- Search -->
            <div class="relative max-w-md">
              <UIInput v-model="searchQuery" placeholder="Поиск студентов..." class="pl-10" />
              <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  class="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
            </div>

            <!-- Sort Controls -->
            <div class="flex items-center gap-4">
              <UISelect v-model="sortBy">
                <option value="progress">По прогрессу</option>
                <option value="name">По имени</option>
                <option value="tests">По тестам</option>
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

          <!-- Students Table -->
          <div class="overflow-hidden rounded-lg border bg-white shadow">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                    >
                      Студент
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                    >
                      Общий прогресс
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                    >
                      Модули
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                    >
                      Уроки
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                    >
                      Тесты
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                    >
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr
                    v-for="student in filteredStudents"
                    :key="student.userId"
                    class="hover:bg-gray-50"
                  >
                    <!-- Student Info -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0">
                          <img
                            v-if="student.image"
                            :src="student.image"
                            :alt="student.fullName"
                            class="h-10 w-10 rounded-full object-cover"
                          />
                          <div
                            v-else
                            class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300"
                          >
                            <span class="text-sm font-medium text-gray-700">
                              {{ student.fullName.charAt(0).toUpperCase() }}
                            </span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">
                            {{ student.fullName }}
                          </div>
                          <div class="text-sm text-gray-500">@{{ student.username }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Overall Progress -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="mr-3 h-2 w-16 rounded-full bg-gray-200">
                          <div
                            :class="getProgressColor(student.progress.overallProgress)"
                            class="h-2 rounded-full transition-all duration-300"
                            :style="{ width: `${student.progress.overallProgress}%` }"
                          ></div>
                        </div>
                        <span class="text-sm font-medium text-gray-900">
                          {{ student.progress.overallProgress }}%
                        </span>
                      </div>
                    </td>

                    <!-- Modules -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ student.progress.completedModules }}/{{ student.progress.totalModules }}
                      </div>
                      <div v-if="student.progress.totalModules > 0" class="text-xs text-gray-500">
                        {{
                          Math.round(
                            (student.progress.completedModules / student.progress.totalModules) *
                              100,
                          )
                        }}%
                      </div>
                    </td>

                    <!-- Lessons -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ student.progress.completedLessons }}/{{ student.progress.totalLessons }}
                      </div>
                      <div v-if="student.progress.totalLessons > 0" class="text-xs text-gray-500">
                        {{
                          Math.round(
                            (student.progress.completedLessons / student.progress.totalLessons) *
                              100,
                          )
                        }}%
                      </div>
                    </td>

                    <!-- Tests -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ student.progress.testsStats.passedTests }}/{{
                          student.progress.testsStats.totalTests
                        }}
                      </div>
                      <div
                        v-if="student.progress.testsStats.avgScore > 0"
                        class="text-xs"
                        :class="getTestScoreColor(student.progress.testsStats.avgScore)"
                      >
                        Средний балл: {{ student.progress.testsStats.avgScore }}%
                      </div>
                      <div v-else class="text-xs text-gray-500">Тестов не проходил</div>
                    </td>

                    <!-- Status -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        v-if="student.progress.courseCompleted"
                        class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                      >
                        <CheckCircle class="mr-1 h-3 w-3" />
                        Завершен
                      </span>
                      <span
                        v-else-if="student.progress.overallProgress > 0"
                        class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                      >
                        <Clock class="mr-1 h-3 w-3" />
                        В процессе
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                      >
                        Не начат
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-if="filteredStudents.length === 0" class="py-12 text-center">
              <Users class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">
                {{ searchQuery ? 'Студенты не найдены' : 'Пока нет студентов' }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{
                  searchQuery
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Студенты появятся после записи на курс'
                }}
              </p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex flex-wrap gap-4">
            <UIButton variant="outline" @click="refresh"> Обновить данные </UIButton>

            <UIButton variant="outline" tag="a" :href="`/app/courses/${courseId}`">
              Вернуться к курсу
            </UIButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
