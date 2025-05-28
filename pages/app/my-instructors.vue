<script setup lang="ts">
import { User, Mail, MessageSquare } from 'lucide-vue-next';

definePageMeta({
  layout: 'profile',
});

// Mock data for instructors - replace with actual API call
const instructors = ref([
  {
    id: 1,
    name: 'Иван Петров',
    email: 'ivan@example.com',
    courses: ['Основы программирования', 'Веб-разработка'],
    lastContact: '2024-04-28',
  },
  {
    id: 2,
    name: 'Анна Сидорова',
    email: 'anna@example.com',
    courses: ['Базы данных', 'Алгоритмы'],
    lastContact: '2024-04-27',
  },
]);
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold">Мои преподаватели</h1>
      <p class="text-muted-foreground">
        Здесь вы можете видеть всех преподавателей, с которыми вы работаете
      </p>
    </div>

    <div class="grid gap-6">
      <UICard v-for="instructor in instructors" :key="instructor.id" class="p-6">
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
              <User class="text-muted-foreground h-6 w-6" />
            </div>
            <div>
              <h3 class="text-lg font-semibold">{{ instructor.name }}</h3>
              <div class="text-muted-foreground flex items-center gap-2 text-sm">
                <Mail class="h-4 w-4" />
                <span>{{ instructor.email }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="font-medium">Курсы:</h4>
            <ul class="text-muted-foreground list-inside list-disc text-sm">
              <li v-for="course in instructor.courses" :key="course">
                {{ course }}
              </li>
            </ul>
          </div>

          <div class="flex items-center justify-between">
            <div class="text-muted-foreground text-sm">
              Последний контакт: {{ instructor.lastContact }}
            </div>
            <UIButton variant="outline">
              <div class="flex items-center gap-2">
                <MessageSquare class="h-4 w-4" />
                <span>Написать</span>
              </div>
            </UIButton>
          </div>
        </div>
      </UICard>
    </div>
  </div>
</template>
