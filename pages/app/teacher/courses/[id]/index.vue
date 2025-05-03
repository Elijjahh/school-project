<script setup lang="ts">
const route = useRoute();
const course = ref({
  id: route.params.id,
  title: 'Название курса',
  description: 'Описание курса...',
  students: 42,
});
const loading = ref(false);
const error = ref('');
const success = ref('');
// Fetch course details by ID here
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Детали курса</h2>
      <p class="text-muted-foreground">Информация о выбранном курсе</p>
    </div>
    <UICard class="max-w-xl">
      <UICardContent>
        <div class="space-y-4">
          <div>
            <div class="font-bold">Название:</div>
            <div>{{ course.title }}</div>
          </div>
          <div>
            <div class="font-bold">Описание:</div>
            <div>{{ course.description }}</div>
          </div>
          <div>
            <div class="font-bold">Записано студентов:</div>
            <div>{{ course.students }}</div>
          </div>
          <div class="flex gap-2">
            <NuxtLink :to="`/app/teacher/courses/${course.id}/edit`">
              <UIButton :disabled="loading">
                <span v-if="loading" class="flex items-center">
                  <span class="mr-2">Загружаем...</span>
                  <span
                    class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  />
                </span>
                <span v-else>Редактировать</span>
              </UIButton>
            </NuxtLink>
            <NuxtLink to="/app/teacher/dashboard">
              <UIButton variant="secondary">Аналитика</UIButton>
            </NuxtLink>
          </div>
          <div v-if="error" class="text-sm font-medium text-destructive">{{ error }}</div>
          <div v-if="success" class="text-sm font-medium text-primary">{{ success }}</div>
        </div>
      </UICardContent>
    </UICard>
  </div>
</template>
