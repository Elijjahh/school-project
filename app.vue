<script setup lang="ts">
definePageMeta({
  layout: 'default',
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <UIModalProvider />
  </NuxtLayout>
</template>

<style scoped lang="scss">
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
