<template>
  <header class="header">
    <div class="container header__container">
      <NuxtLink to="/" class="header__img">
        <img src="/assets/images/logo-img.svg" alt="" />
      </NuxtLink>
      <div class="header__action">
        <div class="header__label">Ещё нет аккаунта?</div>

        <PrimeButton size="large" class="header__button">
          <NuxtLink to="/register">Создать аккаунт</NuxtLink>
        </PrimeButton>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  box-shadow: inset 0px -1px 0px 0px rgb(233, 234, 240);
  background: rgb(255, 255, 255);
  padding: 20px 0px;

  &__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__img {
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

  &__button {
  }
}
</style>
