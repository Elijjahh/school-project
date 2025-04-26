<script lang="ts" setup>
defineProps<{
  title: string;
}>();
</script>

<template>
  <section class="container max-w-2xl mx-auto py-10">
    <div class="p-6">
      <h1 class="text-gray-900 text-4xl font-semibold leading-[48px] tracking-tight text-center">
        {{ title }}
      </h1>
      <slot />
    </div>
  </section>
</template>
