<script lang="ts" setup>
const { loggedIn } = useUserSession()
</script>

<template>
  <header class="header">
    <div class="container header__top">
      <nav class="header__nav">
        <NuxtLink to="/" class="header__nav-link">Home</NuxtLink>
        <NuxtLink to="/courses" class="header__nav-link">Courses</NuxtLink>
        <NuxtLink to="/about" class="header__nav-link">About</NuxtLink>
        <NuxtLink to="/become-instructor" class="header__nav-link">Become an Instructor</NuxtLink>
      </nav>
    </div>
    <div class="header__second">
      <div class="container header__container">
        <NuxtLink to="/" class="header__img">
          <img src="/assets/images/logo-img.svg" alt="Логотип" />
        </NuxtLink>

        <div class="header__right">
          <div class="header__actions">
            <div class="header__icons">
              <NuxtLink to="/wishlist">
                <PrimeOverlayBadge class="inline-flex">
                  <PrimeAvatar icon="pi pi-heart" shape="circle" />
                </PrimeOverlayBadge>
              </NuxtLink>

              <NuxtLink to="/cart">
                <PrimeOverlayBadge class="inline-flex">
                  <PrimeAvatar icon="pi pi-shopping-cart" shape="circle" />
                </PrimeOverlayBadge>
              </NuxtLink>
            </div>

            <PrimeAvatar
              v-if="loggedIn"
              image="https://primefaces.org/cdn/primevue/images/organization/walter.jpg"
              size="large"
              shape="circle"
              class="header__profile-img"
            />
          </div>
          <div v-if="!loggedIn" class="header__create">
            <PrimeButton size="large" class="header__button">
              <NuxtLink to="/login">Войти в аккаунт</NuxtLink>
            </PrimeButton>
            <PrimeButton size="large" severity="secondary" class="header__button">
              <NuxtLink to="/register">Создать аккаунт</NuxtLink>
            </PrimeButton>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  &__top {
    background-color: rgb(0, 0, 0);
  }

  &__nav {
    display: flex;
    gap: 24px;
    padding: 10px 0;
  }

  &__nav-link {
    color: rgb(171, 171, 171);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: rgb(255, 255, 255);
    }
  }

  &__second {
    box-shadow: inset 0px -1px 0px 0px rgb(233, 234, 240);
    background: rgb(255, 255, 255);
    padding: 20px 0px;
  }

  &__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__right {
    display: flex;
    align-items: center;
  }

  &__actions {
    display: flex;
  }

  &__icons {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__profile-img {
    margin-left: 24px;
  }

  &__create {
    margin-left: 24px;
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
</style>
