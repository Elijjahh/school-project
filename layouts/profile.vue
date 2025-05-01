<script setup lang="ts">
import { Home, Book, Users, Heart, Settings } from 'lucide-vue-next';

const tabs = [
  { label: 'Панель', icon: Home, path: '/app/profile' },
  { label: 'Курсы', icon: Book, path: '/app/profile/courses' },
  { label: 'Преподаватели', icon: Users, path: '/app/profile/instructors' },
  { label: 'Избранное', icon: Heart, path: '/app/profile/wishlist' },
  { label: 'Настройки', icon: Settings, path: '/app/profile/settings' },
];

const route = useRoute();
const activeTab = computed(() => {
  return tabs.findIndex((tab) => tab.path === route.path);
});
</script>

<template>
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
            'text-primary border-b-2 border-primary': activeTab === index,
            'text-gray-500 hover:text-gray-700': activeTab !== index,
          }"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </NuxtLink>
      </div>

      <slot />
    </div>
  </div>
</template>
