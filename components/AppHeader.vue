<script lang="ts" setup>
import { ref } from 'vue';

const items = ref([
  {
    label: 'Home',
  },
  {
    label: 'Courses',
  },
  {
    label: 'About',
  },
  {
    label: 'Become an Instructor',
  },
]);
const menubarConfig = ref({
  root: {
    background: 'rgb(0,0, 0)',
    item: {
      focus: { background: 'rgb(31, 30, 30)', color: 'rgb(255, 255, 255)' },
      color: 'rgb(171, 171, 171)',
    },
  },
});

const { loggedIn } = useUserSession();
</script>

<template>
  <header class="header">
    <div class="container header__top">
      <PrimeMenubar :model="items" class="header__menubar" :dt="menubarConfig" />
    </div>
    <div class="wheader">
      <div class="container wheader__container">
        <NuxtLink to="/" class="wheader__img">
          <img src="/assets/images/logo-img.svg" alt="" />
        </NuxtLink>
        <div class="wheader__action">
          <div class="wheader__label">Ещё нет аккаунта?</div>

          <PrimeButton size="large" class="wheader__button">
            <NuxtLink to="/register">Создать аккаунт</NuxtLink>
          </PrimeButton>
        </div>
      </div>
    </div>
    {{ loggedIn }}
  </header>
</template>

<style scoped lang="scss">
.wheader {
  box-shadow: inset 0px -1px 0px 0px rgb(233, 234, 240);
  background: rgb(255, 255, 255);
  padding: 20px 0px;

  &__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__action {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__label {
    color: rgb(78, 85, 102);
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: -1%;
  }
}
.header {
  &__top {
    background-color: rgb(0, 0, 0);
  }
  &__menubar {
    border: none;
  }
}
</style>
