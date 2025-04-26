// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['/assets/scss/main.scss', '~/assets/css/main.css'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  modules: [
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    'nuxt-auth-utils',
    // 'shadcn-nuxt',
  ],
  // shadcn: {
  //   prefix: 'UI',
  //   componentDir: './components/UI',
  // },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    plugins: [tailwindcss()],
  },
  nitro: {
    preset: 'bun',
    experimental: {
      tasks: true,
    },
  },
});
