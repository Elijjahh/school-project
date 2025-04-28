<script setup lang="ts"></script>

<template>
  <main class="main">
    <AppHeader key="header" />
    <div>
      <slot />
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
