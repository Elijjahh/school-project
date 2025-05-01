<script setup lang="ts">
import { User, Mail, MessageSquare } from 'lucide-vue-next';

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
            <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User class="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 class="text-lg font-semibold">{{ instructor.name }}</h3>
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail class="w-4 h-4" />
                <span>{{ instructor.email }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="font-medium">Курсы:</h4>
            <ul class="list-disc list-inside text-sm text-muted-foreground">
              <li v-for="course in instructor.courses" :key="course">
                {{ course }}
              </li>
            </ul>
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm text-muted-foreground">
              Последний контакт: {{ instructor.lastContact }}
            </div>
            <UIButton variant="outline">
              <div class="flex items-center gap-2">
                <MessageSquare class="w-4 h-4" />
                <span>Написать</span>
              </div>
            </UIButton>
          </div>
        </div>
      </UICard>
    </div>
  </div>
</template>
