<script setup lang="ts">
import type { Category } from '~/drizzle/types';

definePageMeta({
  layout: 'profile',
});

const route = useRoute();
const courseId = Number(route.params.courseId);

const { data: categoriesData, pending: categoriesLoading } = useFetch('/api/categories');
const { data: courseData, pending: loading } = useFetch(`/api/courses/${courseId}`);

const errorMessage = ref('');

async function handleCourseSave(payload: {
  title: string;
  description: string;
  image: string;
  categoryId: number;
}) {
  if (!courseData.value) return;
  try {
    await $fetch(`/api/courses/${courseId}`, {
      method: 'PATCH',
      body: {
        title: payload.title,
        description: payload.description,
        image: payload.image,
        categoryId: Number(payload.categoryId),
        creatorId: courseData.value?.teacher?.id || 1,
      },
    });
  } catch {
    errorMessage.value = 'Ошибка при сохранении курса';
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="py-8 text-center">Загрузка...</div>
      <div v-else class="space-y-8">
        <!-- Breadcrumbs -->
        <UIBreadcrumb>
          <UIBreadcrumbList>
            <UIBreadcrumbItem>
              <UIBreadcrumbLink href="/app/my-courses">Мои курсы</UIBreadcrumbLink>
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbLink :href="`/app/courses/${courseId}`">{{
                courseData?.title || 'Курс'
              }}</UIBreadcrumbLink>
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbPage>Редактирование</UIBreadcrumbPage>
            </UIBreadcrumbItem>
          </UIBreadcrumbList>
        </UIBreadcrumb>

        <!-- Header -->
        <div class="space-y-2">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">Редактировать курс</h1>
          <p class="text-gray-600">Измените информацию о курсе и структуру модулей</p>
        </div>

        <!-- Course Edit Form -->
        <UICard class="p-6">
          <CourseEditForm
            v-if="courseData && categoriesData"
            :course="courseData"
            :categories="categoriesData as Category[]"
            :loading="loading"
            :categories-loading="categoriesLoading"
            :categories-error="errorMessage"
            @save="handleCourseSave"
          />
        </UICard>

        <!-- Modules Section -->
        <UICard class="p-6">
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Модули</h2>
              <p class="text-gray-600">
                {{ courseData?.modules?.length || 0 }}
                {{
                  (courseData?.modules?.length || 0) === 1
                    ? 'модуль'
                    : (courseData?.modules?.length || 0) < 5
                      ? 'модуля'
                      : 'модулей'
                }}
              </p>
            </div>
            <UIButton variant="default">
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

          <div v-if="!courseData?.modules?.length" class="py-12 text-center">
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
            <h3 class="mt-4 text-lg font-medium text-gray-900">Нет модулей</h3>
            <p class="mt-2 text-gray-600">
              Добавьте первый модуль, чтобы начать создавать контент курса
            </p>
            <UIButton class="mt-4" variant="outline">
              <NuxtLink :to="`/app/courses/${courseId}/modules/new`"> Создать модуль </NuxtLink>
            </UIButton>
          </div>

          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="(module, index) in courseData.modules"
              :key="module.id"
              class="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div class="flex items-start justify-between">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white"
                >
                  {{ index + 1 }}
                </div>
                <UIButton
                  variant="ghost"
                  size="sm"
                  class="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <NuxtLink :to="`/app/courses/${courseId}/modules/${module.id}/edit`">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              <div class="mt-4">
                <h3 class="line-clamp-2 font-semibold text-gray-900">
                  {{ module.title || 'Без названия' }}
                </h3>
                <p class="mt-2 line-clamp-3 text-sm text-gray-600">
                  {{ module.description || 'Нет описания' }}
                </p>
                <div class="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span>Порядок: {{ module.order }}</span>
                  <span
                    >{{ module.lessons?.length || 0 }}
                    {{ (module.lessons?.length || 0) === 1 ? 'урок' : 'уроков' }}</span
                  >
                </div>
              </div>

              <div class="mt-4">
                <UIButton variant="outline" size="sm" class="w-full">
                  <NuxtLink
                    :to="`/app/courses/${courseId}/modules/${module.id}/edit`"
                    class="flex w-full items-center justify-center gap-2"
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
          </div>
        </UICard>
      </div>
    </div>
  </div>
</template>
