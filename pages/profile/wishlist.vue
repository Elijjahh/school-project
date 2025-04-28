<script setup lang="ts">
import { useWishlistStore } from '~/stores/wishlist';
import { Heart } from 'lucide-vue-next';

const wishlistStore = useWishlistStore();

// Fetch wishlist on page load
onMounted(async () => {
  await wishlistStore.fetchWishlist();
});
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Список желаний</h2>
      <p class="text-muted-foreground">Сохраняйте интересные курсы, чтобы вернуться к ним позже</p>
    </div>

    <div v-if="wishlistStore.isLoading" class="flex justify-center py-8">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
    <div
      v-else-if="wishlistStore.error"
      class="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive"
    >
      <p class="text-center">Произошла ошибка при загрузке списка желаний</p>
    </div>
    <div
      v-else-if="!wishlistStore.courses.length"
      class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
    >
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Heart class="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 class="mt-4 text-lg font-semibold">Список желаний пуст</h3>
      <p class="mt-2 text-sm text-muted-foreground">
        Добавьте курсы в список желаний, чтобы вернуться к ним позже
      </p>
      <UIButton variant="outline" class="mt-4">
        <NuxtLink to="/courses">Перейти к курсам</NuxtLink>
      </UIButton>
    </div>
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <CourseCard v-for="course in wishlistStore.courses" :key="course.id" :course="course" />
    </div>
  </div>
</template>
