<script setup lang="ts">
import { Shield, Users, FolderOpen } from 'lucide-vue-next';

const route = useRoute();

// Используем computed для реактивного обновления активного таба
const adminNav = computed(() => [
  {
    name: 'Заявки преподавателей',
    href: '/admin',
    icon: Users,
    current: route.path === '/admin',
  },
  {
    name: 'Категории',
    href: '/admin/categories',
    icon: FolderOpen,
    current: route.path === '/admin/categories',
  },
]);

// Определяем текущую страницу для breadcrumbs
const currentPageTitle = computed(() => {
  switch (route.path) {
    case '/admin':
      return 'Управление заявками преподавателей';
    case '/admin/categories':
      return 'Управление категориями';
    default:
      return 'Админ панель';
  }
});

useSeoMeta({
  title: () => `${currentPageTitle.value} | Админ панель`,
  description: 'Административная панель образовательной платформы',
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <!-- Навигация админ панели -->
    <div class="border-b border-gray-300 bg-white shadow-sm">
      <div class="container mx-auto">
        <div class="flex items-center space-x-8 py-4">
          <div class="flex items-center space-x-3">
            <div class="rounded-lg bg-gray-900 p-2">
              <Shield class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Админ панель</h1>
              <p class="text-sm text-gray-600">Управление платформой</p>
            </div>
          </div>
        </div>

        <!-- Табы навигации -->
        <div class="flex space-x-8 border-t border-gray-200">
          <NuxtLink
            v-for="item in adminNav"
            :key="item.name"
            :to="item.href"
            class="flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors"
            :class="[
              item.current
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-400 hover:text-gray-700',
            ]"
          >
            <component :is="item.icon" class="h-4 w-4" />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <main class="container mx-auto py-8">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">{{ currentPageTitle }}</h2>
        <div class="mt-2 flex items-center space-x-2 text-sm text-gray-500">
          <NuxtLink to="/admin" class="hover:text-gray-700">Админ панель</NuxtLink>
          <span>/</span>
          <span class="text-gray-900">{{ currentPageTitle }}</span>
        </div>
      </div>

      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
