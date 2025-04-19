<script lang="ts" setup>
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { NuxtError } from '#app';

const validationSchema = toTypedSchema(
  zod.object({
    email: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' })
      .email('Введите корректную почту'),
    password: zod
      .string({ message: 'Это обязательное поле' })
      .min(8, { message: 'Длина пароля должна быть хотя бы 8 символов' }),
  }),
);

const { handleSubmit, errors } = useForm({
  validationSchema,
});

const emailInputId = useId();
const passwordInputId = useId();

const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');

const onSubmit = handleSubmit(() => {
  submitForm();
});

const loading = ref(false);
const error = ref('');

const { fetch: fetchUserSession } = useUserSession();
const router = useRouter();

async function submitForm() {
  const submitData = {
    email: email.value,
    password: password.value,
  };

  loading.value = true;
  error.value = '';

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: submitData,
    });

    await fetchUserSession();
    router.push('/');
  } catch (err) {
    const statusCode = (err as NuxtError).statusCode;

    if (statusCode == 400) error.value = 'Введите корректные данные';
    else if (statusCode == 404) error.value = 'Пользователь с такой почтой не найден';
    else if (statusCode == 401) error.value = 'Неверный пароль';
    else error.value = 'Ошибка на сервере';
  }

  loading.value = false;
}
</script>

<template>
  <section class="login">
    <div class="login__img">
      <div class="login__img-wrapper"><img src="/assets/images/login-img.png" alt="" /></div>
    </div>
    <div class="login__content">
      <h1 class="login__title">Войдите в ваш аккаунт</h1>
      <form class="login__form" @submit.prevent="onSubmit">
        <div class="login__input-groups">
          <div class="login__input-group">
            <label :for="emailInputId" class="login__label">Email</label>
            <PrimeInputText
              :id="emailInputId"
              v-model="email"
              :invalid="!!errors.email"
              class="login__input"
              placeholder="Email"
            />
            <p v-if="errors.email" class="login__error">
              {{ errors.email }}
            </p>
          </div>

          <div class="login__input-group">
            <label :for="passwordInputId" class="login__label">Пароль</label>
            <PrimePassword
              :id="passwordInputId"
              v-model="password"
              fluid
              :feedback="false"
              :invalid="!!errors.password"
              class="login__input"
              placeholder="Пароль"
            />
            <p v-if="errors.password" class="login__error">
              {{ errors.password }}
            </p>
          </div>
        </div>

        <p class="login__error login__error_general">{{ error }}</p>

        <PrimeButton
          type="submit"
          :label="loading ? 'Входим...' : 'Войти'"
          size="large"
          class="login__button"
        />
      </form>
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

  &__input-group:has(.p-invalid) &__label {
    color: var(--p-inputtext-invalid-placeholder-color);
  }

  &__error {
    color: var(--p-inputtext-invalid-placeholder-color);
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: -1%;

    &_general {
      margin-top: 10px;
    }
  }

  &__button {
    margin-top: 24px;
    width: 100%;
  }
}
</style>
