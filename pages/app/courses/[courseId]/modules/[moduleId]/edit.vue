<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const route = useRoute();
const courseId = Number(route.params.courseId);
const moduleId = Number(route.params.moduleId);

const { data: moduleDataRaw, pending: loading, refresh } = useFetch(`/api/modules/${moduleId}`);
const { data: courseData } = useFetch(`/api/courses/${courseId}`);

const moduleData = computed(() => {
  return moduleDataRaw.value
    ? {
        id: moduleDataRaw.value.id,
        title: moduleDataRaw.value.title,
        description: moduleDataRaw.value.description,
        order: moduleDataRaw.value.order,
      }
    : null;
});

const lessons = computed(() => {
  return Array.isArray(moduleDataRaw.value?.lessons)
    ? moduleDataRaw.value.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order,
      }))
    : [];
});

const error = ref('');

async function handleModuleSave(payload: { title: string; description: string; order: number }) {
  if (!moduleData.value) return;
  try {
    await $fetch(`/api/modules/${moduleId}`, {
      method: 'PATCH',
      body: {
        courseId,
        title: payload.title,
        description: payload.description,
        order: payload.order,
      },
    });
    await refresh();
  } catch {
    error.value = 'Ошибка при сохранении модуля';
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
              <UIBreadcrumbLink :href="`/app/courses/${courseId}/edit`">{{
                moduleData?.title || 'Модуль'
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
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">Редактировать модуль</h1>
          <p class="text-gray-600">Измените информацию о модуле и список уроков</p>
        </div>

        <!-- Module Edit Form -->
        <UICard class="p-6">
          <ModuleEditForm
            v-if="moduleData"
            :module="moduleData"
            :idx="0"
            :loading="loading"
            @save="handleModuleSave"
          />
        </UICard>

        <!-- Lessons Section -->
        <UICard class="p-6">
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Уроки</h2>
              <p class="text-gray-600">
                {{ lessons.length }}
                {{ lessons.length === 1 ? 'урок' : lessons.length < 5 ? 'урока' : 'уроков' }}
              </p>
            </div>
            <UIButton variant="default">
              <NuxtLink
                :to="`/app/courses/${courseId}/modules/${moduleId}/lessons/new`"
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
                Добавить урок
              </NuxtLink>
            </UIButton>
          </div>

          <div v-if="!lessons.length" class="py-12 text-center">
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
            <h3 class="mt-4 text-lg font-medium text-gray-900">Нет уроков</h3>
            <p class="mt-2 text-gray-600">Добавьте первый урок в этот модуль</p>
            <UIButton class="mt-4" variant="outline">
              <NuxtLink :to="`/app/courses/${courseId}/modules/${moduleId}/lessons/new`">
                Создать урок
              </NuxtLink>
            </UIButton>
          </div>

          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="(lesson, index) in lessons"
              :key="lesson.id"
              class="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div class="flex items-start justify-between">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700"
                >
                  {{ index + 1 }}
                </div>
                <UIButton
                  variant="ghost"
                  size="sm"
                  class="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <NuxtLink
                    :to="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/edit`"
                  >
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
                  {{ lesson.title || 'Без названия' }}
                </h3>
                <div class="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span>Урок {{ lesson.order }}</span>
                </div>
              </div>

              <div class="mt-4">
                <UIButton variant="outline" size="sm" class="w-full">
                  <NuxtLink
                    :to="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/edit`"
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
