<script lang="ts" setup>
import { Heart, ShoppingCart } from 'lucide-vue-next';
const { loggedIn, user } = useUserSession();
</script>

<template>
  <header class="w-full">
    <div class="bg-black">
      <div class="container mx-auto">
        <nav class="flex gap-6 py-2.5">
          <NuxtLink to="/" class="text-gray-400 hover:text-white transition-colors">
            Главная
          </NuxtLink>
          <NuxtLink to="/courses" class="text-gray-400 hover:text-white transition-colors">
            Курсы
          </NuxtLink>
          <NuxtLink to="/about" class="text-gray-400 hover:text-white transition-colors">
            О нас
          </NuxtLink>
          <NuxtLink
            to="/become-instructor"
            class="text-gray-400 hover:text-white transition-colors"
          >
            Стать преподавателем
          </NuxtLink>
        </nav>
      </div>
    </div>

    <div class="border-b bg-white py-5">
      <div class="container mx-auto flex justify-between items-center">
        <NuxtLink to="/" class="flex items-center">
          <img src="/assets/images/logo-img.svg" alt="Логотип" />
        </NuxtLink>

        <div class="flex items-center">
          <div class="flex items-center">
            <div class="flex items-center gap-6">
              <NuxtLink to="/profile/wishlist">
                <Heart class="w-5 h-5" />
              </NuxtLink>
            </div>

            <NuxtLink v-if="loggedIn" to="/profile" class="ml-6">
              <UIAvatar class="size-10">
                <UIAvatarImage v-if="user?.image" :src="user.image" />
                <UIAvatarFallback v-else>
                  {{ user?.firstname[0] }}{{ user?.lastname[0] }}
                </UIAvatarFallback>
              </UIAvatar>
            </NuxtLink>
          </div>
          <div v-if="!loggedIn" class="ml-6 flex items-center gap-4">
            <UIButton variant="default" size="lg">
              <NuxtLink to="/login">Войти в аккаунт</NuxtLink>
            </UIButton>
            <UIButton variant="secondary" size="lg">
              <NuxtLink to="/register">Создать аккаунт</NuxtLink>
            </UIButton>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
