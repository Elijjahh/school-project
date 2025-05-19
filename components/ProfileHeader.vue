<script lang="ts" setup>
const { user } = useUserSession();

const displayRole = computed(() => {
  if (user.value?.role === 'teacher') return 'Преподаватель';
  if (user.value?.role === 'admin') return 'Администратор';
  return '';
});
</script>

<template>
  <div class="flex items-center gap-8 rounded-lg bg-white p-4 shadow">
    <div class="flex h-[150px] w-[150px] items-center justify-center overflow-hidden rounded-full">
      <UIAvatar class="h-full w-full">
        <UIAvatarImage
          v-if="user?.image"
          :src="user.image"
          :alt="`${user?.firstname} ${user?.lastname}`"
        />
        <UIAvatarFallback v-else>
          {{ user?.firstname?.[0] }}{{ user?.lastname?.[0] }}
        </UIAvatarFallback>
      </UIAvatar>
    </div>
    <div class="flex flex-col gap-2">
      <h1 class="m-0 text-4xl font-semibold">{{ user?.firstname }} {{ user?.lastname }}</h1>
      <p class="m-0 text-gray-500">@{{ user?.username }}</p>
      <p v-if="displayRole" class="text-primary m-0 capitalize">{{ displayRole }}</p>
    </div>
  </div>
</template>
