<script setup lang="ts">
import { Book, Users, Heart } from 'lucide-vue-next';

const features = [
  {
    title: 'Качественное обучение',
    description: 'Наши курсы разработаны опытными преподавателями и экспертами в своих областях',
    icon: Book,
  },
  {
    title: 'Профессиональные преподаватели',
    description:
      'Все наши преподаватели имеют большой опыт работы и регулярно повышают свою квалификацию',
    icon: Users,
  },
  {
    title: 'Индивидуальный подход',
    description: 'Мы учитываем потребности каждого студента и помогаем достичь поставленных целей',
    icon: Heart,
  },
];
</script>

<template>
  <div class="bg-background flex min-h-screen items-center justify-center">
    <div class="mx-auto w-full max-w-4xl space-y-8 p-8">
      <div class="space-y-4 text-center">
        <h1 class="text-4xl font-bold tracking-tight">О нашей платформе</h1>
        <p class="text-muted-foreground mx-auto max-w-2xl text-xl">
          Мы создаем образовательную платформу, которая помогает людям получать новые знания и
          навыки
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <UICard v-for="feature in features" :key="feature.title" class="p-6">
          <div class="space-y-4">
            <component :is="feature.icon" class="text-primary h-12 w-12" />
            <h3 class="text-xl font-semibold">{{ feature.title }}</h3>
            <p class="text-muted-foreground">{{ feature.description }}</p>
          </div>
        </UICard>
      </div>

      <UICard class="p-6">
        <div class="space-y-4 text-center">
          <h2 class="text-2xl font-bold">Присоединяйтесь к нам</h2>
          <p class="text-muted-foreground mx-auto max-w-2xl">
            Начните свое обучение уже сегодня и откройте новые возможности для своего развития
          </p>
          <UIButton>
            <NuxtLink to="/register">Начать обучение</NuxtLink>
          </UIButton>
        </div>
      </UICard>
    </div>
  </div>
</template>
