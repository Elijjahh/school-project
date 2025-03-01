// https://nuxt.com/docs/api/configuration/nuxt-config
import ThemePreset from './theme';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  css: ['/assets/scss/main.scss'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  modules: [
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    '@primevue/nuxt-module',
    // '@prisma/nuxt',
  ],
  vite: {
    resolve: {
      alias: {
        '.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js',
      },
    },
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
  },
  // prisma: {
  //   generateClient: false,
  //   autoSetupPrisma: true,
  //   // installStudio: false,
  //   runMigration: false,
  // },
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
