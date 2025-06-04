<script setup lang="ts">
import { useWishlistStore } from '~/stores/wishlist';

interface LessonProgress {
  lessonId: number;
  title: string;
  order: number;
  completed: boolean;
  tests: Array<{
    testId: number;
    maxAttempts: number;
    attemptsCount: number;
    completedAttempts: number;
    bestScore: number;
    bestPercentage: number;
    passed: boolean;
    lastAttemptAt: string | null;
  }>;
}

interface ModuleProgress {
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
  modules: ModuleProgress[];
}

const { user } = useUserSession();
const route = useRoute();
const courseId = computed(() => Number(route.params.courseId));
const router = useRouter();

// Fetch course data
const {
  data: course,
  pending: loading,
  error,
  refresh: refreshCourse,
} = await useFetch(`/api/courses/${courseId.value}`, {
  default: () => null,
});

const isStarting = ref(false);

const hasError = computed(() => error.value?.message || null);
const hasStarted = computed(() => !!course.value?.isParticipating);

// Fetch course progress if user is enrolled
const { data: courseProgress } = await useFetch<CourseProgressData>(
  `/api/courses/${courseId.value}/progress`,
  {
    query: computed(() => (hasStarted.value && user.value?.id ? { userId: user.value.id } : {})),
    default: () => null,
    server: false,
  },
);

const wishlistStore = useWishlistStore();
await wishlistStore.fetchWishlist();

const isInWishlist = computed(() => {
  return !!course.value?.isInWishlist;
});

const isCreator = computed(() => {
  return user.value && course.value && user.value.id === course.value.creator.id;
});

// Progress checking functions
const isModuleCompleted = (moduleId: number) => {
  if (!courseProgress.value?.modules) return false;
  const moduleProgress = courseProgress.value.modules.find(
    (m: ModuleProgress) => m.moduleId === moduleId,
  );
  return moduleProgress?.completed || false;
};

const isLessonCompleted = (lessonId: number) => {
  if (!courseProgress.value?.modules) return false;
  for (const module of courseProgress.value.modules) {
    const lesson = module.lessons?.find((l: LessonProgress) => l.lessonId === lessonId);
    if (lesson) return lesson.completed;
  }
  return false;
};

async function startCourse() {
  isStarting.value = true;
  try {
    await $fetch(`/api/courses/${courseId.value}/participate`, {
      method: 'POST',
    });
    // Refresh course data to get updated participation status
    await refreshCourse();
  } catch (err) {
    console.error('Error starting course:', err);
  }
  isStarting.value = false;
}

async function addToWishlist() {
  try {
    await $fetch(`/api/courses/${courseId.value}/wishlist`, {
      method: 'POST',
    });
    // Refresh course data to get updated wishlist status
    await refreshCourse();
  } catch (err) {
    console.error('Error adding to wishlist:', err);
  }
}

async function removeFromWishlist() {
  try {
    await $fetch(`/api/courses/${courseId.value}/wishlist`, {
      method: 'DELETE',
    });
    // Refresh course data to get updated wishlist status
    await refreshCourse();
  } catch (err) {
    console.error('Error removing from wishlist:', err);
  }
}

function toggleWishlist() {
  if (isInWishlist.value) removeFromWishlist();
  else addToWishlist();
}

const isRemoving = ref(false);

async function removeCourse() {
  if (!confirm('Вы уверены, что хотите удалить этот курс?')) return;
  isRemoving.value = true;
  try {
    await $fetch(`/api/courses/${courseId.value}`, { method: 'DELETE' });
    router.push('/app/my-courses');
  } catch (err) {
    console.error('Error removing course:', err);
  } finally {
    isRemoving.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="loading" class="py-8 text-center">Загрузка...</div>
    <div v-else-if="hasError" class="py-8 text-center text-red-500">{{ hasError }}</div>
    <div v-else-if="course" class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="relative overflow-hidden rounded-2xl bg-white shadow-lg">
          <!-- Course Image -->
          <div class="relative h-80">
            <img
              v-if="course.image"
              :src="course.image"
              :alt="course.title"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"
            >
              <div class="text-center text-white">
                <svg
                  class="mx-auto h-20 w-20 text-white/80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p class="mt-3 text-lg font-medium text-white/90">Курс</p>
              </div>
            </div>
            <!-- Overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
            ></div>
          </div>

          <!-- Course Info Overlay -->
          <div class="absolute right-0 bottom-0 left-0 p-6 text-white">
            <div class="mb-3">
              <span
                class="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm"
              >
                {{ course.category.name }}
              </span>
            </div>
            <h1 class="mb-3 text-3xl font-bold md:text-4xl">{{ course.title }}</h1>
            <p class="line-clamp-3 text-base text-white/90 md:text-lg">{{ course.description }}</p>
          </div>

          <!-- Teacher Info Card -->
          <div class="absolute top-6 right-6">
            <div class="rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur-sm">
              <div class="flex items-center gap-3">
                <img
                  v-if="course.creator.image"
                  :src="course.creator.image"
                  :alt="course.creator.firstname"
                  class="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                />
                <div
                  v-else
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white ring-2 ring-white"
                >
                  {{ course.creator.firstname.charAt(0) }}{{ course.creator.lastname.charAt(0) }}
                </div>
                <div>
                  <div class="font-semibold text-gray-900">
                    {{ course.creator.firstname }} {{ course.creator.lastname }}
                  </div>
                  <div class="text-sm text-gray-600">Преподаватель</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-8 lg:grid-cols-4">
        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- Course Structure -->
          <UICard class="p-6">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Структура курса</h2>
                <p class="text-gray-600">
                  {{ course.modules?.length || 0 }}
                  {{
                    (course.modules?.length || 0) === 1
                      ? 'модуль'
                      : (course.modules?.length || 0) < 5
                        ? 'модуля'
                        : 'модулей'
                  }}
                  •
                  {{ course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0 }}
                  {{
                    (course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0) ===
                    1
                      ? 'урок'
                      : 'уроков'
                  }}
                  <span v-if="hasStarted || isCreator">
                    •
                    {{
                      course.modules?.reduce(
                        (acc, m) =>
                          acc +
                          (m.lessons?.reduce((acc2, l) => acc2 + (l.tests?.length || 0), 0) || 0),
                        0,
                      ) || 0
                    }}
                    {{
                      (course.modules?.reduce(
                        (acc, m) =>
                          acc +
                          (m.lessons?.reduce((acc2, l) => acc2 + (l.tests?.length || 0), 0) || 0),
                        0,
                      ) || 0) === 1
                        ? 'тест'
                        : 'тестов'
                    }}
                  </span>
                </p>
              </div>
              <UIButton v-if="isCreator" variant="outline" size="sm">
                <NuxtLink
                  :to="`/app/courses/${courseId}/modules/new`"
                  class="flex items-center gap-2"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Добавить модуль
                </NuxtLink>
              </UIButton>
            </div>

            <!-- Information message for non-participants -->
            <div
              v-if="!hasStarted && !isCreator"
              class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
            >
              <div class="flex items-start gap-3">
                <svg
                  class="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 class="font-medium text-blue-900">Начните курс для доступа к материалам</h3>
                  <p class="mt-1 text-sm text-blue-700">
                    Чтобы получить доступ к урокам и тестам, необходимо начать прохождение курса.
                    Нажмите кнопку "Начать курс" в правой панели.
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div v-if="!course.modules?.length" class="py-12 text-center">
                <svg
                  class="mx-auto h-16 w-16 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Курс пока пустой</h3>
                <p class="mt-2 text-gray-600">
                  Добавьте первый модуль, чтобы начать создавать контент
                </p>
                <UIButton v-if="isCreator" class="mt-4" variant="outline">
                  <NuxtLink :to="`/app/courses/${courseId}/modules/new`"> Создать модуль </NuxtLink>
                </UIButton>
              </div>

              <!-- Modules List -->
              <div
                v-for="(module, moduleIndex) in course.modules"
                :key="module.id"
                class="space-y-3"
              >
                <!-- Module Header -->
                <div
                  class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div class="flex min-w-0 flex-1 items-center gap-4">
                    <div class="flex items-center gap-2">
                      <div
                        class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 font-medium text-white"
                      >
                        {{ moduleIndex + 1 }}
                      </div>
                      <!-- Module completion indicator -->
                      <div
                        v-if="hasStarted"
                        :class="isModuleCompleted(module.id) ? 'bg-green-500' : 'bg-gray-300'"
                        class="h-3 w-3 rounded-full"
                        :title="
                          isModuleCompleted(module.id) ? 'Модуль завершен' : 'Модуль не завершен'
                        "
                      ></div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="truncate text-lg font-semibold text-gray-900">
                        {{ module.title }}
                        <span
                          v-if="hasStarted && isModuleCompleted(module.id)"
                          class="ml-2 text-green-600"
                          >✓</span
                        >
                      </h3>
                      <p v-if="module.description" class="line-clamp-2 text-sm text-gray-600">
                        {{ module.description }}
                      </p>
                      <div class="mt-1 flex items-center gap-4 text-xs text-gray-500">
                        <span
                          >{{ module.lessons?.length || 0 }}
                          {{ (module.lessons?.length || 0) === 1 ? 'урок' : 'уроков' }}</span
                        >
                        <span v-if="hasStarted || isCreator"
                          >{{
                            module.lessons?.reduce((acc, l) => acc + (l.tests?.length || 0), 0) || 0
                          }}
                          {{
                            (module.lessons?.reduce((acc, l) => acc + (l.tests?.length || 0), 0) ||
                              0) === 1
                              ? 'тест'
                              : 'тестов'
                          }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <div v-if="isCreator" class="flex flex-shrink-0 items-center gap-2">
                    <UIButton variant="ghost" size="sm">
                      <NuxtLink
                        :to="`/app/courses/${courseId}/modules/${module.id}/lessons/new`"
                        class="flex items-center gap-1"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Урок
                      </NuxtLink>
                    </UIButton>
                    <UIButton variant="ghost" size="sm">
                      <NuxtLink
                        :to="`/app/courses/${courseId}/modules/${module.id}/edit`"
                        class="flex items-center gap-1"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Редактировать
                      </NuxtLink>
                    </UIButton>
                  </div>
                </div>

                <!-- Lessons List -->
                <div v-if="module.lessons?.length" class="ml-14 space-y-2">
                  <div
                    v-for="(lesson, lessonIndex) in module.lessons"
                    :key="lesson.id"
                    class="group"
                  >
                    <!-- Lesson Item -->
                    <div
                      class="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 transition-all hover:shadow-sm"
                    >
                      <div class="flex min-w-0 flex-1 items-center gap-3">
                        <div
                          class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600"
                        >
                          {{ lessonIndex + 1 }}
                        </div>
                        <!-- Lesson completion indicator -->
                        <div
                          v-if="hasStarted"
                          :class="isLessonCompleted(lesson.id) ? 'bg-green-500' : 'bg-gray-300'"
                          class="h-2 w-2 rounded-full"
                          :title="
                            isLessonCompleted(lesson.id) ? 'Урок завершен' : 'Урок не завершен'
                          "
                        ></div>
                        <div class="min-w-0 flex-1">
                          <NuxtLink
                            v-if="hasStarted || isCreator"
                            :to="`/app/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}`"
                            class="block"
                          >
                            <h4
                              class="truncate font-medium text-gray-900 transition-colors hover:text-blue-600"
                            >
                              {{ lesson.title }}
                              <span
                                v-if="hasStarted && isLessonCompleted(lesson.id)"
                                class="ml-2 text-green-600"
                                >✓</span
                              >
                            </h4>
                          </NuxtLink>
                          <h4 v-else class="cursor-not-allowed truncate font-medium text-gray-500">
                            {{ lesson.title }}
                          </h4>
                          <div class="flex items-center gap-3 text-xs text-gray-500">
                            <span>Урок {{ lesson.order }}</span>
                            <span v-if="lesson.tests?.length && (hasStarted || isCreator)"
                              >{{ lesson.tests.length }}
                              {{ lesson.tests.length === 1 ? 'тест' : 'тестов' }}</span
                            >
                          </div>
                        </div>
                      </div>

                      <div class="flex flex-shrink-0 items-center gap-1">
                        <!-- View Lesson Button for participants and creator -->
                        <UIButton v-if="hasStarted || isCreator" variant="ghost" size="sm">
                          <NuxtLink
                            :to="`/app/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}`"
                            class="flex items-center gap-1"
                          >
                            <svg
                              class="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </NuxtLink>
                        </UIButton>
                        <!-- Locked lesson indicator for non-participants -->
                        <UIButton v-else variant="ghost" size="sm" disabled class="opacity-50">
                          <svg
                            class="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </UIButton>

                        <!-- Creator-only buttons -->
                        <div
                          v-if="isCreator"
                          class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <UIButton variant="ghost" size="sm">
                            <NuxtLink
                              :to="`/app/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}/tests/new`"
                            >
                              <svg
                                class="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </NuxtLink>
                          </UIButton>
                          <UIButton variant="ghost" size="sm">
                            <NuxtLink
                              :to="`/app/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}/edit`"
                            >
                              <svg
                                class="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </NuxtLink>
                          </UIButton>
                        </div>
                      </div>
                    </div>

                    <!-- Tests List -->
                    <div v-if="lesson.tests?.length && hasStarted" class="mt-2 ml-11 space-y-1">
                      <div
                        v-for="(test, testIndex) in lesson.tests"
                        :key="test.id"
                        class="group flex items-center justify-between rounded-md border border-gray-50 bg-gray-50/50 p-3"
                      >
                        <div class="flex min-w-0 flex-1 items-center gap-3">
                          <div
                            class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-orange-100 text-xs font-medium text-orange-700"
                          >
                            T{{ testIndex + 1 }}
                          </div>
                          <div class="min-w-0 flex-1">
                            <span class="text-sm font-medium text-gray-700">Тест</span>
                            <div class="text-xs text-gray-500">
                              {{ test.questionsCount }}
                              {{
                                test.questionsCount === 1
                                  ? 'вопрос'
                                  : test.questionsCount < 5
                                    ? 'вопроса'
                                    : 'вопросов'
                              }}
                              • макс. {{ test.maxAttempts }}
                              {{
                                test.maxAttempts === 1
                                  ? 'попытка'
                                  : test.maxAttempts < 5
                                    ? 'попытки'
                                    : 'попыток'
                              }}
                            </div>
                          </div>
                        </div>

                        <UIButton
                          v-if="isCreator"
                          variant="ghost"
                          size="sm"
                          class="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <NuxtLink
                            :to="`/app/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}/tests/${test.id}/edit`"
                          >
                            <svg
                              class="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </NuxtLink>
                        </UIButton>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty Module State -->
                <div v-else class="ml-14">
                  <div class="rounded-lg border border-dashed border-gray-200 p-6 text-center">
                    <svg
                      class="mx-auto h-8 w-8 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p class="mt-2 text-sm text-gray-500">В модуле пока нет уроков</p>
                    <UIButton v-if="isCreator" variant="ghost" size="sm" class="mt-2">
                      <NuxtLink :to="`/app/courses/${courseId}/modules/${module.id}/lessons/new`">
                        Добавить урок
                      </NuxtLink>
                    </UIButton>
                  </div>
                </div>
              </div>
            </div>
          </UICard>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-16 space-y-4">
            <!-- Actions Card -->
            <UICard class="p-6">
              <h3 class="mb-4 font-semibold text-gray-900">Управление курсом</h3>
              <div class="space-y-3">
                <template v-if="isCreator">
                  <UIButton variant="default" class="w-full justify-start">
                    <NuxtLink
                      :to="`/app/courses/${courseId}/edit`"
                      class="flex w-full items-center gap-2"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Редактировать курс
                    </NuxtLink>
                  </UIButton>
                  <UIButton variant="secondary" class="w-full justify-start">
                    <NuxtLink
                      :to="`/app/courses/${courseId}/analytics`"
                      class="flex w-full items-center gap-2"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      Аналитика курса
                    </NuxtLink>
                  </UIButton>
                  <UIButton
                    variant="destructive"
                    class="w-full justify-start"
                    :loading="isRemoving"
                    :disabled="isRemoving"
                    @click="removeCourse"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Удалить курс
                  </UIButton>
                </template>
                <template v-else>
                  <UIButton
                    v-if="!hasStarted"
                    variant="default"
                    class="w-full justify-start"
                    :loading="isStarting"
                    :disabled="isStarting"
                    @click="startCourse"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Начать курс
                  </UIButton>
                  <UIButton v-else variant="secondary" class="w-full justify-start" disabled>
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Курс начат
                  </UIButton>
                  <UIButton
                    :variant="isInWishlist ? 'destructive' : 'outline'"
                    class="w-full justify-start"
                    @click="toggleWishlist"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    {{ isInWishlist ? 'Убрать из избранного' : 'В избранное' }}
                  </UIButton>
                </template>
              </div>
            </UICard>

            <!-- Progress Card -->
            <UICard v-if="hasStarted && user?.id" class="p-6">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="font-semibold text-gray-900">Прогресс</h3>
                <UIButton variant="outline" size="sm">
                  <NuxtLink
                    :to="`/app/courses/${courseId}/progress`"
                    class="flex items-center gap-1"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Детали
                  </NuxtLink>
                </UIButton>
              </div>
              <CourseProgress :courseId="courseId" :userId="user.id" :showDetails="false" />
            </UICard>

            <!-- Statistics Card -->
            <UICard class="p-6">
              <h3 class="mb-4 font-semibold text-gray-900">Статистика</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Модули</span>
                  <span class="font-medium">{{ course.modules?.length || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Уроки</span>
                  <span class="font-medium">{{
                    course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0
                  }}</span>
                </div>
                <div v-if="hasStarted || isCreator" class="flex justify-between">
                  <span class="text-sm text-gray-600">Тесты</span>
                  <span class="font-medium">{{
                    course.modules?.reduce(
                      (acc, m) =>
                        acc +
                        (m.lessons?.reduce((acc2, l) => acc2 + (l.tests?.length || 0), 0) || 0),
                      0,
                    ) || 0
                  }}</span>
                </div>
              </div>
            </UICard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
