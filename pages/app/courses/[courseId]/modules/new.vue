<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);

const { data: courseData } = useFetch(`/api/courses/${courseId}`);

const loading = ref(false);
const error = ref('');

async function handleModuleCreate(payload: { title: string; description: string }) {
  loading.value = true;
  error.value = '';
  try {
    const created = await $fetch(`/api/modules`, {
      method: 'POST',
      body: {
        courseId,
        title: payload.title,
        description: payload.description,
      },
    });
    // После создания модуля редиректим на его страницу редактирования
    router.push(`/app/courses/${courseId}/modules/${created.id}/edit`);
  } catch {
    error.value = 'Ошибка при создании модуля';
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
              <UIBreadcrumbLink :href="`/app/courses/${courseId}/edit`">{{
                courseData?.title || 'Курс'
              }}</UIBreadcrumbLink>
            </UIBreadcrumbItem>
            <UIBreadcrumbSeparator />
            <UIBreadcrumbItem>
              <UIBreadcrumbPage>Создать модуль</UIBreadcrumbPage>
            </UIBreadcrumbItem>
          </UIBreadcrumbList>
        </UIBreadcrumb>

        <!-- Header -->
        <div class="space-y-2">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">Создать модуль</h1>
          <p class="text-gray-600">Заполните информацию о новом модуле</p>
        </div>

        <!-- Module Creation Form -->
        <ModuleCreateForm :loading="loading" @save="handleModuleCreate" />

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
