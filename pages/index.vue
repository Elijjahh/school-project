<script lang="ts" setup></script>
<template>
  <section>
    <h1>Главная</h1>
    это пример использования компонентов primevue
    <form>
      <PrimeInputText></PrimeInputText>
      <PrimeButton>Кликни на меня</PrimeButton>
    </form>

    <AuthState>
      <template #default="{ loggedIn, clear }">
        <button v-if="loggedIn" @click="clear">Logout</button>
        <NuxtLink v-else to="/login">Login</NuxtLink>
      </template>
      <template #placeholder>
        <button disabled>Loading...</button>
      </template>
    </AuthState>
  </section>
</template>
