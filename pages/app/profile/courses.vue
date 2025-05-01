<script setup lang="ts">
import { Clock, Check } from 'lucide-vue-next';

// Mock data for courses - replace with actual API call
const courses = ref([
  {
    id: 1,
    title: 'Основы программирования',
    progress: 75,
    lastAccessed: '2024-04-28',
    completed: false,
  },
  {
    id: 2,
    title: 'Веб-разработка',
    progress: 100,
    lastAccessed: '2024-04-27',
    completed: true,
  },
  {
    id: 3,
    title: 'Базы данных',
    progress: 30,
    lastAccessed: '2024-04-26',
    completed: false,
  },
]);
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold">Мои курсы</h1>
      <p class="text-muted-foreground">Здесь вы можете видеть все курсы, на которые вы записаны</p>
    </div>

    <div class="grid gap-6">
      <UICard v-for="course in courses" :key="course.id" class="p-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ course.title }}</h3>
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4 text-muted-foreground" />
              <span class="text-sm text-muted-foreground">
                Последний доступ: {{ course.lastAccessed }}
              </span>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Прогресс</span>
              <span>{{ course.progress }}%</span>
            </div>
            <div class="h-2 bg-muted rounded-full">
              <div
                class="h-full bg-primary rounded-full"
                :style="{ width: `${course.progress}%` }"
              ></div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <UIButton variant="outline">
              <NuxtLink :to="`/app/courses/${course.id}`">Продолжить обучение</NuxtLink>
            </UIButton>
            <div v-if="course.completed" class="flex items-center gap-2 text-green-600">
              <Check class="w-4 h-4" />
              <span class="text-sm">Завершено</span>
            </div>
          </div>
        </div>
      </UICard>
    </div>
  </div>
</template>
