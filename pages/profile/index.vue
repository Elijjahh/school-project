<script setup lang="ts">
import { Play, Headphones, Trophy, Users } from 'lucide-vue-next';

const { user } = useUserSession();

const {
  data: stats,
  pending: statsPending,
  error: statsError,
} = await useFetch(`/api/auth/users/${user.value?.id}/stats`);

const {
  data: courses,
  pending: coursesPending,
  error: coursesError,
} = await useFetch(`/api/auth/users/${user.value?.id}/courses`);
</script>

<template>
  <div>
    <div v-if="statsPending" class="text-center py-8">Загрузка статистики...</div>
    <div v-else-if="statsError" class="text-center text-red-500 py-8">
      Не удалось загрузить статистику
    </div>
    <div v-else class="grid grid-cols-4 gap-6">
      <StatsCard
        :value="stats?.enrolledCourses ?? '-'"
        label="Ваши курсы"
        :icon="Play"
        icon-color="bg-blue-100"
        bg-color="bg-blue-50"
      />

      <StatsCard
        :value="stats?.activeCourses ?? '-'"
        label="Активные курсы"
        :icon="Headphones"
        icon-color="bg-green-100"
        bg-color="bg-green-50"
      />

      <StatsCard
        :value="stats?.completedCourses ?? '-'"
        label="Завершенные курсы"
        :icon="Trophy"
        icon-color="bg-yellow-100"
        bg-color="bg-yellow-50"
      />

      <StatsCard
        :value="stats?.instructors ?? '-'"
        label="Преподаватели"
        :icon="Users"
        icon-color="bg-purple-100"
        bg-color="bg-purple-50"
      />
    </div>

    <div v-if="coursesPending" class="text-center py-8">Загрузка курсов...</div>
    <div v-else-if="coursesError" class="text-center text-red-500 py-8">
      Не удалось загрузить курсы
    </div>
    <div v-else>
      <div v-if="courses && courses.length > 0">
        <h2 class="text-2xl font-semibold mb-6">Ваши курсы</h2>
        <div class="grid grid-cols-3 gap-6">
          <CourseCard
            v-for="course in courses"
            :key="course.id"
            :course="{
              id: course.id.toString(),
              title: course.title,
              description: course.description,
              image: course.image || undefined,
              completed: course.completed,
              progress: course.progress || undefined,
            }"
          />
        </div>
      </div>
      <h2 v-else class="text-2xl font-semibold text-center py-8">У вас пока нет курсов</h2>
    </div>
  </div>
</template>
