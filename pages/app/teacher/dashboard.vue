<script setup lang="ts">
import { Users, Book, CheckCircle } from 'lucide-vue-next';
const { user } = useUserSession();

const { data, pending, error } = useFetch(`/api/auth/users/${user.value!.id}/dashboard-stats`);

function getPercent(finished: number, total: number): string {
  if (!total) return '0%';
  return `${Math.round((finished / total) * 100)}%`;
}

const stats = computed(() => {
  const d = data.value || { studentsCount: 0, coursesCount: 0, finishedParticipations: 0 };
  return [
    { label: 'Студенты', value: d.studentsCount, icon: Users },
    { label: 'Курсы', value: d.coursesCount, icon: Book },
    {
      label: 'Завершения',
      value: getPercent(d.finishedParticipations, d.studentsCount),
      icon: CheckCircle,
    },
  ];
});
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Аналитика преподавателя</h2>
      <p class="text-muted-foreground">Статистика, активность и вовлечённость ваших студентов</p>
    </div>

    <div v-if="pending" class="text-center py-8">Загрузка...</div>
    <div v-else-if="error" class="text-red-500 text-center py-8">{{ error.message }}</div>
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
