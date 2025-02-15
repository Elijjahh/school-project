<script setup>
import { ref } from 'vue';

const visible = ref(false);
</script>

<template>
  <div class="sign_up">
    <PrimeButton label="Регистрация" @click="visible = true" class="sign_up__button head" />
    <PrimeDialog v-model:visible="visible" modal header="Регистрация" :style="{ width: '25rem' }">
      <div class="sign_up__container">
        <div class="sign_up__point">
          <label for="firstname" class="font-semibold w-24">Имя</label>
          <PrimeInputText id="firstname" class="sign_up__inputs" autocomplete="off" />
        </div>
        <div class="sign_up__point">
          <Primelabel for="lastname" class="font-semibold w-24">Фамилия</Primelabel>
          <PrimeInputText id="lastname" class="sign_up__inputs" autocomplete="off" />
        </div>
        <div class="sign_up__point">
          <Primelabel for="email" class="font-semibold w-24">Email</Primelabel>
          <PrimeInputText id="email" class="sign_up__inputs" autocomplete="off" />
        </div>
        <div class="sign_up__point">
          <Primelabel for="password" class="font-semibold w-24">Пароль</Primelabel>
          <PrimeInputText id="password" class="sign_up__inputs" autocomplete="off" />
        </div>
        <div class="sign_up__point">
          <Primelabel for="confirm_password" class="font-semibold w-24">Повторите</Primelabel>
          <PrimeInputText id="confirm_password" class="sign_up__inputs" autocomplete="off" />
        </div>
      </div>
      <div class="sign_up__buttons">
        <PrimeButton
          type="button"
          class="sign_up__button"
          label="Sign up"
          @click="visible = false"
        ></PrimeButton>
      </div>
    </PrimeDialog>
  </div>
</template>

<style scoped lang="scss">
.sign_up {
  &__button head {
    background-color: rgb(11, 228, 30);
    padding: 15px;
  }

  &__container {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    gap: 10px;
    row-gap: 10px;
  }

  &__point {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  &__inputs {
    padding: 10px;
    border-radius: 15px;
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__button {
    margin-top: 15px;
    padding: 10px 36px;
    border-radius: 12px;

    background-color: green;
  }
}
</style>
