<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

interface CreatedQuestion {
  id: number;
}

interface CreatedTest {
  id: number;
}

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);
const moduleId = Number(route.params.moduleId);
const lessonId = Number(route.params.lessonId);

const { data: courseData } = useFetch(`/api/courses/${courseId}`);
const { data: moduleData } = useFetch(`/api/modules/${moduleId}`);
const { data: lessonData } = useFetch(`/api/lessons/${lessonId}`);

const loading = ref(false);
const error = ref('');

async function handleTestCreate(payload: {
  maxAttempts: number;
  questions: Array<{ text: string; answers: Array<{ text: string; correct: boolean }> }>;
}) {
  loading.value = true;
  error.value = '';
  try {
    // Создаем тест
    const createdTest = await $fetch<CreatedTest>('/api/tests', {
      method: 'POST',
      body: {
        lessonId,
        maxAttempts: payload.maxAttempts,
      },
    });

    // Создаем вопросы и ответы
    for (const questionData of payload.questions) {
      const createdQuestion = await $fetch<CreatedQuestion>('/api/questions', {
        method: 'POST',
        body: {
          testId: createdTest.id,
          text: questionData.text,
        },
      });

      for (const answerData of questionData.answers) {
        await $fetch('/api/answers', {
          method: 'POST',
          body: {
            questionId: createdQuestion.id,
            text: answerData.text,
            correct: answerData.correct,
          },
        });
      }
    }

    // После создания редиректим на страницу редактирования теста
    router.push(
      `/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/tests/${createdTest.id}/edit`,
    );
  } catch {
    error.value = 'Ошибка при создании теста';
  } finally {
    loading.value = false;
  }
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
              <UIBreadcrumbLink
                :href="`/app/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/edit`"
                >{{ lessonData?.title || 'Урок' }}</UIBreadcrumbLink
              >
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbPage>Создать тест</UIBreadcrumbPage>
            </UIBreadcrumbItem>
          </UIBreadcrumbList>
        </UIBreadcrumb>

        <!-- Header -->
        <div class="space-y-2">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">Создать тест</h1>
          <p class="text-gray-600">Создайте тест с вопросами для урока</p>
        </div>

        <!-- Test Creation Form -->
        <TestCreateForm :lesson-id="lessonId" :loading="loading" @save="handleTestCreate" />

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
