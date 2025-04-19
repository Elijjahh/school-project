<script lang="ts" setup></script>

<template>
  <section>
    <PrimeButton>
      <NuxtLink to="/login">логин</NuxtLink>
    </PrimeButton>
    <PrimeButton>
      <NuxtLink to="/register">регистрация</NuxtLink>
    </PrimeButton>
  </section>
</template>

<style scoped>
.cards-container {
  display: grid;
  grid-template-columns: 50rem;
  overflow: hidden;
  width: 80%;
  margin: 0 auto;
  justify-content: center;
}

.cards-title {
  font-size: 2.5rem;
  margin: 40px 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin: 40px 10px;
}

.cards-btns {
  display: flex;
  justify-content: left;
}
</style>
