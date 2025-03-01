<script lang="ts" setup></script>
<template>
  <section class="register">
    <div class="register__img">
      <div class="register__img-wrapper"><img src="/assets/images/register-img.png" alt="" /></div>
    </div>
    <div class="register__content">
      <h1 class="register__title">Создайте аккаунт</h1>
      <div class="register__form">
        <div class="register__input-groups">
          <div class="register__input-group">
            <label for="" class="register__label">Ваше полное имя</label>
            <div class="register__input-columns">
              <PrimeInputText fluid class="register__input" placeholder="Фамилия" />
              <PrimeInputText fluid class="register__input" placeholder="Имя" />
            </div>
          </div>
          <div class="register__input-group">
            <label for="" class="register__label">Имя пользователя</label>
            <PrimeInputText class="register__input" placeholder="Имя пользователя" />
          </div>
          <div class="register__input-group">
            <label for="" class="register__label">Email</label>
            <PrimeInputText class="register__input" placeholder="Email" />
          </div>
          <div class="register__input-columns">
            <div class="register__input-group">
              <label for="" class="register__label">Создайте пароль</label>
              <PrimeInputText class="register__input" placeholder="Создайте пароль" />
            </div>
            <div class="register__input-group">
              <label for="" class="register__label">Повторите пароль</label>
              <PrimeInputText class="register__input" placeholder="Повторите пароль" />
            </div>
          </div>
        </div>

        <div class="register__form-footer">
          <div class="register__checkbox">
            <PrimeCheckbox class="register__checkbox-body"></PrimeCheckbox>
            <label class="register__checkbox-label">Согласен с условиями пользования</label>
          </div>

          <PrimeButton
            label="Создать аккаунт"
            size="large"
            icon="pi pi-arrow-right"
            icon-pos="right"
            class="register__button"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.register {
  display: grid;
  grid-template-columns: 1fr 1.3fr;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }

  &__img {
    background-color: rgb(235, 235, 255);
    display: flex;
    align-items: center;

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
    padding: calc(176 / 1920 * 100vw) calc(300 / 1920 * 100vw) calc(176 / 1920 * 100vw)
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

  &__input-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 18px;
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
