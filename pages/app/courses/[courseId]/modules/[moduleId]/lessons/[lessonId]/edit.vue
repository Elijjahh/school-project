<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const route = useRoute();
const courseId = Number(route.params.courseId);
const moduleId = Number(route.params.moduleId);
const lessonId = Number(route.params.lessonId);

const { data: lessonRaw, pending: loading, refresh } = useFetch(`/api/lessons/${lessonId}`);
const { data: courseData } = useFetch(`/api/courses/${courseId}`);
const { data: moduleData } = useFetch(`/api/modules/${moduleId}`);

const lesson = computed(() => {
  return lessonRaw.value
    ? {
        id: lessonRaw.value.id,
        title: lessonRaw.value.title,
        content: lessonRaw.value.content,
        videoUrl: lessonRaw.value.videoUrl,
        order: lessonRaw.value.order,
      }
    : null;
});

const tests = computed(() => {
  return Array.isArray(lessonRaw.value?.tests)
    ? lessonRaw.value.tests.map((t) => ({
        id: t.id,
        maxAttempts: t.maxAttempts,
        questionsCount: t.questions?.length || 0,
      }))
    : [];
});

const error = ref('');
const deletingTestId = ref<number | null>(null);

async function handleLessonSave(payload: {
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}) {
  if (!lesson.value) return;

  try {
    if (lessonId) {
      const apiPayload = {
        moduleId,
        title: payload.title,
        content: payload.content,
        videoUrl: payload.videoUrl,
        order: payload.order,
      };

      await $fetch(`/api/lessons/${lessonId}`, {
        method: 'PATCH',
        body: apiPayload,
      });
    }
    await refresh();
  } catch (err) {
    console.error('Error saving lesson:', err);
    error.value = 'Ошибка при сохранении урока';
  }
}

const { confirm, alert } = useModal();

async function handleDeleteTest(testId: number) {
  const confirmed = await confirm({
    title: 'Удаление теста',
    message: 'Вы уверены, что хотите удалить этот тест? Это действие нельзя отменить.',
    confirmText: 'Удалить',
    cancelText: 'Отмена',
  });

  if (!confirmed) {
    return;
  }

  deletingTestId.value = testId;
  try {
    await $fetch(`/api/tests/${testId}`, {
      method: 'DELETE',
    });
    await refresh(); // Обновляем данные урока
  } catch (testError) {
    console.error('Error deleting test:', testError);

    if (
      testError &&
      typeof testError === 'object' &&
      'statusCode' in testError &&
      (testError as { statusCode: number }).statusCode === 409
    ) {
      const errorMessage =
        'statusMessage' in testError
          ? (testError as { statusMessage: string }).statusMessage
          : null;
      await alert({
        title: 'Невозможно удалить тест',
        message:
          errorMessage || 'У теста есть связанные данные, которые необходимо удалить сначала',
        type: 'error',
      });
    } else {
      await alert({
        title: 'Ошибка удаления',
        message: 'Не удалось удалить тест. Попробуйте позже.',
        type: 'error',
      });
    }
  } finally {
    deletingTestId.value = null;
  }
}

async function handleLessonDelete() {
  const confirmed = await confirm({
    title: 'Удаление урока',
    message: 'Вы уверены, что хотите удалить этот урок?',
    confirmText: 'Удалить',
    cancelText: 'Отмена',
  });

  if (!confirmed) return;

  try {
    await $fetch(`/api/lessons/${lessonId}`, {
      method: 'DELETE',
    });
    await navigateTo(`/app/courses/${courseId}/modules/${moduleId}/edit`);
  } catch (deleteError) {
    console.error('Error deleting lesson:', deleteError);

    // Простой тест модального окна
    await alert({
      title: 'Тестовое сообщение',
      message: 'Урок нельзя удалить, так как у него есть тесты или прогресс студентов.',
      type: 'error',
    });
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
              <UIBreadcrumbLink :href="`/app/courses/${courseId}/modules/${moduleId}/edit`">{{
                moduleData?.title || 'Модуль'
              }}</UIBreadcrumbLink>
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbPage>{{ lesson?.title || 'Урок' }}</UIBreadcrumbPage>
            </UIBreadcrumbItem>
          </UIBreadcrumbList>
        </UIBreadcrumb>

        <!-- Header -->
        <div class="space-y-2">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">Редактировать урок</h1>
          <p class="text-gray-600">Измените информацию об уроке</p>
        </div>

        <!-- Lesson Edit Form -->
        <UICard class="p-6">
          <LessonEditForm
            v-if="lesson"
            :lesson="lesson"
            :module-id="moduleId"
            :idx="0"
            :loading="loading"
            @save="handleLessonSave"
            @remove="handleLessonDelete"
          />
        </UICard>

        <!-- Tests Section -->
        <UICard class="p-6">
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Тесты</h2>
              <p class="text-gray-600">
                {{ tests.length }}
                {{ tests.length === 1 ? 'тест' : tests.length < 5 ? 'теста' : 'тестов' }}
              </p>
            </div>
            <UIButton variant="default">
              <NuxtLink
                :to="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/tests/new`"
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
                Добавить тест
              </NuxtLink>
            </UIButton>
          </div>

          <div v-if="!tests.length" class="py-12 text-center">
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
            <h3 class="mt-4 text-lg font-medium text-gray-900">Нет тестов</h3>
            <p class="mt-2 text-gray-600">
              Добавьте тест для проверки знаний учеников по этому уроку
            </p>
            <UIButton class="mt-4" variant="outline">
              <NuxtLink
                :to="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/tests/new`"
              >
                Создать тест
              </NuxtLink>
            </UIButton>
          </div>

          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="(test, index) in tests"
              :key="test.id"
              class="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div class="flex items-start justify-between">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-700"
                >
                  T{{ index + 1 }}
                </div>
                <div class="flex gap-1">
                  <UIButton
                    variant="ghost"
                    size="sm"
                    class="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <NuxtLink
                      :to="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/tests/${test.id}/edit`"
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
                  <UIButton
                    variant="ghost"
                    size="sm"
                    class="text-red-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50"
                    :disabled="deletingTestId === test.id"
                    @click="handleDeleteTest(test.id)"
                  >
                    <svg
                      v-if="deletingTestId === test.id"
                      class="h-4 w-4 animate-spin"
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
                    <svg
                      v-else
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </UIButton>
                </div>
              </div>

              <div class="mt-4">
                <h3 class="font-semibold text-gray-900">Тест</h3>
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
                    {{ test.questionsCount }}
                    {{
                      test.questionsCount === 1
                        ? 'вопрос'
                        : test.questionsCount < 5
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
                    макс. {{ test.maxAttempts }}
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

              <div class="mt-4">
                <UIButton variant="outline" size="sm" class="w-full">
                  <NuxtLink
                    :to="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/tests/${test.id}/edit`"
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
                <UIButton
                  variant="destructive"
                  size="sm"
                  class="mt-2 w-full"
                  :disabled="deletingTestId === test.id"
                  @click="handleDeleteTest(test.id)"
                >
                  <svg
                    v-if="deletingTestId === test.id"
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
                  <svg
                    v-else
                    class="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {{ deletingTestId === test.id ? 'Удаление...' : 'Удалить тест' }}
                </UIButton>
              </div>
            </div>
          </div>
        </UICard>

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
      </div>
    </div>
  </div>
</template>
