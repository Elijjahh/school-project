<script lang="ts" setup></script>

<template>
  <section class="container mx-auto flex gap-4 min-h-screen">
    <UIButton>
      <NuxtLink to="/login">Войти в аккаунт</NuxtLink>
    </UIButton>
    <UIButton variant="secondary">
      <NuxtLink to="/register">Создать аккаунт</NuxtLink>
    </UIButton>
  </section>
</template>
