// https://nuxt.com/docs/api/configuration/nuxt-config
import ThemePreset from './theme';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  css: ['/assets/scss/main.scss'],
  modules: [
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    '@primevue/nuxt-module',
    'nuxt-auth-utils',
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },
  nitro: {
    preset: 'bun',
    experimental: {
      tasks: true,
    },
  },
  primevue: {
    options: {
      theme: {
        preset: ThemePreset,
        options: {
          darkModeSelector: false,
        },
      },
    },
    components: {
      prefix: 'Prime',
    },
  },
});
