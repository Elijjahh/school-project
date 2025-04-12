<script setup lang="ts"></script>

<template>
  <main class="main">
    <AppHeader />
    <NuxtPage />
    <AppFooter />
  </main>
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

.main {
  min-height: 100vh;

  display: grid;
  grid-template-rows: auto 1fr;
}
</style>
