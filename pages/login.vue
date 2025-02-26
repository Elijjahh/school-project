<script lang="ts" setup></script>
<template>
  <section class="login">
    <div class="login__img">
      <div class="login__img-wrapper"><img src="/assets/images/login-img.png" alt="" /></div>
    </div>
    <div class="login__content">
      <h1 class="login__title">Войдите в ваш аккаунт</h1>
      <div class="login__form">
        <div class="login__input-groups">
          <div class="login__input-group">
            <label for="" class="login__label">Email</label>
            <PrimeInputText class="login__input" placeholder="Email" />
          </div>
          <div class="login__input-group">
            <label for="" class="login__label">Пароль</label>
            <PrimeInputText class="login__input" placeholder="Пароль" />
          </div>
        </div>

        <div class="login__form-footer">
          <div class="login__checkbox">
            <PrimeCheckbox class="login__checkbox-body"></PrimeCheckbox>
            <label class="login__checkbox-label">Запомните меня</label>
          </div>

          <PrimeButton
            label="Войти"
            size="large"
            icon="pi pi-arrow-right"
            icon-pos="right"
            class="login__button"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.login {
  display: grid;
  grid-template-columns: 1fr 1.3fr;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }

  &__img {
    background-color: rgb(235, 235, 255);
    display: flex;
    align-items: flex-end;

    @media (max-width: 700px) {
      display: none;
    }
  }

  &__img-wrapper {
    aspect-ratio: 1;
    img {
      height: 100%;
      width: 100%;
      object-fit: contain;
    }
  }

  &__content {
    padding: calc(270 / 1920 * 100vw) calc(300 / 1920 * 100vw) calc(270 / 1920 * 100vw)
      calc(133 / 1920 * 100vw);

    @media (max-width: 1300px) {
      padding-right: calc(133 / 1920 * 100vw);
    }
  }

  &__title {
    color: rgb(29, 32, 38);
    font-size: 40px;
    font-weight: 600;
    line-height: 48px;
    letter-spacing: -1%;
    text-align: center;
  }

  &__form {
    margin-top: 40px;
  }

  &__input-groups {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label {
    color: rgb(29, 32, 38);
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: -1%;
  }

  &__input {
  }

  &__form-footer {
    margin-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__checkbox-body {
  }

  &__checkbox-label {
    color: rgb(78, 85, 102);
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: -1%;
  }

  &__button {
    width: fit-content;
  }
}
</style>
