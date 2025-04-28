<script setup lang="ts">
import { useWishlistStore } from '~/stores/wishlist';
import { Compass } from 'lucide-vue-next';

const { data: courses, pending, error } = await useFetch('/api/courses');
const wishlistStore = useWishlistStore();

const categories = [
  { id: 'all', label: 'Все' },
  { id: 'intro', label: 'Вводные' },
  { id: 'main', label: 'Основные' },
  { id: 'career', label: 'Профориентация' },
];

const selectedCategory = ref('all');

// Fetch wishlist on page load
onMounted(async () => {
  await wishlistStore.fetchWishlist();
});
</script>

<template>
  <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="space-y-8">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Курсы</h1>
        <p class="text-muted-foreground">Выберите курс и начните обучение прямо сейчас</p>
      </div>

      <div class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <UIButton
            v-for="category in categories"
            :key="category.id"
            variant="outline"
            size="sm"
            :class="{
              'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground':
                selectedCategory === category.id,
            }"
            @click="selectedCategory = category.id"
          >
            {{ category.label }}
          </UIButton>
        </div>

        <div v-if="pending" class="flex justify-center py-8">
          <div
            class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          />
        </div>
        <div
          v-else-if="error"
          class="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive"
        >
          <p class="text-center">Не удалось загрузить курсы</p>
        </div>
        <div
          v-else-if="!courses?.length"
          class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
        >
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Compass class="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 class="mt-4 text-lg font-semibold">Нет доступных курсов</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            В данный момент нет доступных курсов в этой категории
          </p>
        </div>
        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CourseCard v-for="course in courses" :key="course.id" :course="course" />
        </div>
      </div>
    </div>
  </div>
</template>
