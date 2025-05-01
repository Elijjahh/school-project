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
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="w-full max-w-4xl mx-auto p-8 space-y-8">
      <div class="text-center space-y-4">
        <h1 class="text-4xl font-bold tracking-tight">О нашей платформе</h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          Мы создаем образовательную платформу, которая помогает людям получать новые знания и
          навыки
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UICard v-for="feature in features" :key="feature.title" class="p-6">
          <div class="space-y-4">
            <component :is="feature.icon" class="w-12 h-12 text-primary" />
            <h3 class="text-xl font-semibold">{{ feature.title }}</h3>
            <p class="text-muted-foreground">{{ feature.description }}</p>
          </div>
        </UICard>
      </div>

      <UICard class="p-6">
        <div class="text-center space-y-4">
          <h2 class="text-2xl font-bold">Присоединяйтесь к нам</h2>
          <p class="text-muted-foreground max-w-2xl mx-auto">
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
