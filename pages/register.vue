<script lang="ts" setup>
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { NuxtError } from '#app';

const validationSchema = toTypedSchema(
  zod.object({
    lastname: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' }),
    firstname: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' }),
    username: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' }),
    email: zod
      .string({ message: 'Это обязательное поле' })
      .min(1, { message: 'Это обязательное поле' })
      .email('Введите корректную почту'),
    password: zod
      .string({ message: 'Это обязательное поле' })
      .min(8, { message: 'Длина пароля должна быть хотя бы 8 символов' })
      .refine((_passwordValue) => password.value === confirmPassword.value, {
        message: 'Пароли должны совпадать',
      }),
    confirmPassword: zod
      .string({ message: 'Это обязательное поле' })
      .min(8, { message: 'Длина пароля должна быть хотя бы 8 символов' })
      .refine((_passwordValue) => password.value === confirmPassword.value, {
        message: 'Пароли должны совпадать',
      }),
  }),
);

const { handleSubmit, errors } = useForm({
  validationSchema,
});

const lastnameInputId = useId();
const usernameInputId = useId();
const emailInputId = useId();
const passwordInputId = useId();
const confirmPasswordInputId = useId();

const { value: lastname } = useField<string>('lastname');
const { value: firstname } = useField<string>('firstname');
const { value: username } = useField<string>('username');
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
const { value: confirmPassword } = useField<string>('confirmPassword');

const onSubmit = handleSubmit(() => {
  submitForm();
});

const loading = ref(false);
const error = ref('');

const { fetch: fetchUserSession } = useUserSession();
const router = useRouter();

async function submitForm() {
  const submitData = {
    lastname: lastname.value,
    firstname: firstname.value,
    username: username.value,
    email: email.value,
    password: password.value,
  };

  loading.value = true;
  error.value = '';

  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: submitData,
    });

    await fetchUserSession();
    router.push('/');
  } catch (err) {
    const statusCode = (err as NuxtError).statusCode;

    if (statusCode == 400) error.value = 'Введите корректные данные';
    else if (statusCode == 409) error.value = 'Пользователь с такими данными уже существует';
    else error.value = 'Ошибка на сервере';
  }

  loading.value = false;
}
</script>

<template>
  <section class="register">
    <div class="register__img">
      <div class="register__img-wrapper"><img src="/assets/images/register-img.png" alt="" /></div>
    </div>
    <div class="register__content">
      <h1 class="register__title">Создайте аккаунт</h1>
      <form class="register__form" @submit.prevent="onSubmit">
        <div class="register__input-groups">
          <div class="register__input-group">
            <label :for="lastnameInputId" class="register__label">Ваше полное имя</label>
            <div class="register__input-columns">
              <div>
                <PrimeInputText
                  :id="lastnameInputId"
                  v-model="lastname"
                  :invalid="!!errors.lastname"
                  fluid
                  class="register__input"
                  placeholder="Фамилия"
                />
                <p v-if="errors.lastname" class="register__error">
                  {{ errors.lastname }}
                </p>
              </div>
              <div>
                <PrimeInputText
                  v-model="firstname"
                  :invalid="!!errors.firstname"
                  fluid
                  class="register__input"
                  placeholder="Имя"
                />
                <p v-if="errors.firstname" class="register__error">
                  {{ errors.firstname }}
                </p>
              </div>
            </div>
          </div>
          <div class="register__input-group">
            <label :for="usernameInputId" class="register__label">Имя пользователя</label>
            <PrimeInputText
              :id="usernameInputId"
              v-model="username"
              :invalid="!!errors.username"
              class="register__input"
              placeholder="Имя пользователя"
            />
            <p v-if="errors.username" class="register__error">
              {{ errors.username }}
            </p>
          </div>
          <div class="register__input-group">
            <label :for="emailInputId" class="register__label">Email</label>
            <PrimeInputText
              :id="emailInputId"
              v-model="email"
              :invalid="!!errors.email"
              class="register__input"
              placeholder="Email"
            />
            <p v-if="errors.email" class="register__error">
              {{ errors.email }}
            </p>
          </div>
          <div class="register__input-columns">
            <div class="register__input-group">
              <label :for="passwordInputId" class="register__label">Создайте пароль</label>
              <PrimePassword
                :id="passwordInputId"
                v-model="password"
                :invalid="!!errors.password"
                fluid
                :feedback="false"
                :toggle-mask="true"
                class="register__input"
                placeholder="Создайте пароль"
              />
              <p v-if="errors.password" class="register__error">
                {{ errors.password }}
              </p>
            </div>
            <div class="register__input-group">
              <label :for="confirmPasswordInputId" class="register__label">Повторите пароль</label>
              <PrimePassword
                :id="confirmPasswordInputId"
                v-model="confirmPassword"
                :invalid="!!errors.confirmPassword"
                fluid
                :feedback="false"
                :toggle-mask="true"
                class="register__input"
                placeholder="Повторите пароль"
              />
              <p v-if="errors.confirmPassword" class="register__error">
                {{ errors.confirmPassword }}
              </p>
            </div>
          </div>
        </div>

        <p class="login__error login__error_general">{{ error }}</p>

        <PrimeButton
          type="submit"
          :label="loading ? 'Создаем аккаунт...' : 'Создать аккаунт'"
          size="large"
          class="register__button"
        />
      </form>
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

  &__input-group:has(.p-invalid) &__label {
    color: var(--p-inputtext-invalid-placeholder-color);
  }

  &__input {
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
    margin-top: 24px;
    width: 100%;
  }
}
</style>
