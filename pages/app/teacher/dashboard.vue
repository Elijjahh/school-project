<script setup lang="ts">
import { Users, Book, CheckCircle } from 'lucide-vue-next';
// In a real app, fetch these stats from an API
const stats = [
  { label: 'Студенты', value: 120, icon: Users },
  { label: 'Курсы', value: 5, icon: Book },
  { label: 'Завершения', value: '87%', icon: CheckCircle },
];
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Аналитика преподавателя</h2>
      <p class="text-muted-foreground">Статистика, активность и вовлечённость ваших студентов</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :icon="stat.icon"
      />
    </div>

    <!-- TODO: add chart -->
  </div>
</template>
