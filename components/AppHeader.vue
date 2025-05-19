<script lang="ts" setup>
import { Heart } from 'lucide-vue-next';
const { loggedIn, user } = useUserSession();
</script>

<template>
  <header
    class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
  >
    <div class="container mx-auto flex h-14 items-center">
      <div class="mr-4 flex">
        <NuxtLink to="/" class="mr-6 flex items-center space-x-2">
          <img src="/assets/images/logo-img.svg" alt="Логотип" class="w-48" />
        </NuxtLink>
        <nav class="flex items-center space-x-6 text-sm font-medium">
          <NuxtLink to="/" class="hover:text-foreground/80 text-foreground/60 transition-colors">
            Главная
          </NuxtLink>
          <NuxtLink
            to="/app/courses"
            class="hover:text-foreground/80 text-foreground/60 transition-colors"
          >
            Курсы
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="hover:text-foreground/80 text-foreground/60 transition-colors"
          >
            О нас
          </NuxtLink>
          <NuxtLink
            to="/become-instructor"
            class="hover:text-foreground/80 text-foreground/60 transition-colors"
          >
            Стать преподавателем
          </NuxtLink>
        </nav>
      </div>
      <div class="flex flex-1 items-center justify-end space-x-2">
        <div class="flex items-center space-x-4">
          <NuxtLink to="/app/profile/wishlist" class="text-muted-foreground hover:text-foreground">
            <Heart class="h-5 w-5" />
          </NuxtLink>

          <template v-if="loggedIn">
            <NuxtLink to="/app/profile">
              <UIAvatar class="h-8 w-8">
                <UIAvatarImage v-if="user?.image" :src="user.image" />
                <UIAvatarFallback v-else>
                  {{ user?.firstname[0] }}{{ user?.lastname[0] }}
                </UIAvatarFallback>
              </UIAvatar>
            </NuxtLink>
          </template>
          <template v-else>
            <UIButton variant="ghost" size="sm">
              <NuxtLink to="/login">Войти</NuxtLink>
            </UIButton>
            <UIButton variant="default" size="sm">
              <NuxtLink to="/register">Регистрация</NuxtLink>
            </UIButton>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
