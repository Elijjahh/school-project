<script setup lang="ts">
import { User, Mail, MessageSquare } from 'lucide-vue-next';

definePageMeta({
  layout: 'profile',
});

const { user } = useUserSession();

// Fetch instructors from API
const {
  data: instructorsData,
  pending,
  error,
} = await useFetch(`/api/auth/users/${user.value?.id}/instructors`, {
  server: false,
  default: () => ({ instructors: [] }),
});

const instructors = computed(() => instructorsData.value?.instructors || []);
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold">Мои преподаватели</h1>
      <p class="text-muted-foreground">
        Здесь вы можете видеть всех преподавателей, с которыми вы работаете
      </p>
    </div>

    <div v-if="pending" class="flex justify-center py-8">
      <div class="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
    </div>

    <div v-else-if="error" class="py-8 text-center text-red-500">
      Не удалось загрузить список преподавателей
    </div>

    <div v-else-if="instructors.length === 0" class="py-8 text-center">
      <div class="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <User class="text-muted-foreground h-6 w-6" />
      </div>
      <h3 class="mb-2 text-lg font-semibold">Нет преподавателей</h3>
      <p class="text-muted-foreground">Запишитесь на курсы, чтобы увидеть своих преподавателей</p>
    </div>

    <div v-else class="grid gap-6">
      <UICard v-for="instructor in instructors" :key="instructor.id" class="p-6">
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <img
              :src="instructor.image"
              :alt="instructor.name"
              class="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h3 class="text-lg font-semibold">{{ instructor.name }}</h3>
              <div class="text-muted-foreground flex items-center gap-2 text-sm">
                <Mail class="h-4 w-4" />
                <span>{{ instructor.email }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="font-medium">Курсы ({{ instructor.coursesCount }}):</h4>
            <ul class="text-muted-foreground list-inside list-disc text-sm">
              <li v-for="course in instructor.courses" :key="course.id">
                {{ course.title }}
              </li>
            </ul>
          </div>

          <div class="flex items-center justify-end">
            <UIButton variant="outline">
              <div class="flex items-center gap-2">
                <MessageSquare class="h-4 w-4" />
                <span>Связаться</span>
              </div>
            </UIButton>
          </div>
        </div>
      </UICard>
    </div>
  </div>
</template>
