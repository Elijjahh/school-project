<script setup lang="ts">
import { Home, Book, Users, Heart, Settings } from 'lucide-vue-next';

const { user } = useUserSession();

// Определяем роль пользователя
const isTeacher = computed(() => user.value?.role === 'teacher');

const studentTabs = [
  { label: 'Панель', icon: Home, path: '/app' },
  { label: 'Курсы', icon: Book, path: '/app/my-courses' },
  { label: 'Преподаватели', icon: Users, path: '/app/my-instructors' },
  { label: 'Избранное', icon: Heart, path: '/app/wishlist' },
  { label: 'Настройки', icon: Settings, path: '/app/settings' },
];

const teacherTabs = [
  { label: 'Обзор', icon: Home, path: '/app' },
  { label: 'Мои курсы', icon: Book, path: '/app/my-courses' },
  { label: 'Настройки', icon: Settings, path: '/app/settings' },
];

const tabs = computed(() => (isTeacher.value ? teacherTabs : studentTabs));

const route = useRoute();
const activeTab = computed(() => {
  return tabs.value.findIndex((tab) => tab.path === route.path);
});
</script>

<template>
  <main class="main">
    <AppHeader key="header" />
    <div>
      <div class="container mx-auto">
        <div class="flex flex-col gap-8">
          <ProfileHeader />

          <div class="flex gap-4 border-b">
            <NuxtLink
              v-for="(tab, index) in tabs"
              :key="index"
              :to="tab.path"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
              :class="{
                'text-primary border-primary border-b-2': activeTab === index,
                'text-gray-500 hover:text-gray-700': activeTab !== index,
              }"
            >
              <component :is="tab.icon" class="h-4 w-4" />
              {{ tab.label }}
            </NuxtLink>
          </div>

          <slot />
        </div>
      </div>
    </div>
    <AppFooter key="footer" />
  </main>
</template>

<style scoped lang="scss">
.main {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
}
</style>
