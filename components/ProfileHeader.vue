<script lang="ts" setup>
const { user } = useUserSession();

const displayRole = computed(() => {
  if (user.value?.role === 'teacher') return 'Преподаватель';
  if (user.value?.role === 'admin') return 'Администратор';
  return '';
});
</script>

<template>
  <div class="flex items-center gap-8 p-4 bg-white rounded-lg shadow">
    <div class="w-[150px] h-[150px] rounded-full overflow-hidden flex items-center justify-center">
      <UIAvatar class="w-full h-full">
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
      <h1 class="text-4xl font-semibold m-0">{{ user?.firstname }} {{ user?.lastname }}</h1>
      <p class="text-gray-500 m-0">@{{ user?.username }}</p>
      <p v-if="displayRole" class="text-primary capitalize m-0">{{ displayRole }}</p>
    </div>
  </div>
</template>
