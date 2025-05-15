<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.id);

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
    router.push(`/app/teacher/courses/${courseId}/modules/${created.id}/edit`);
  } catch {
    error.value = 'Ошибка при создании модуля';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="space-y-8 mb-10">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Создать модуль</h2>
      <p class="text-muted-foreground">Заполните информацию о новом модуле</p>
    </div>
    <ModuleCreateForm :loading="loading" @save="handleModuleCreate" />
    <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
  </div>
</template>
