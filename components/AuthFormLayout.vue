<script lang="ts" setup>
defineProps<{
  title: string;
}>();
</script>

<template>
  <section class="container mx-auto max-w-2xl py-10">
    <div class="p-6">
      <h1 class="text-center text-4xl leading-[48px] font-semibold tracking-tight text-gray-900">
        {{ title }}
      </h1>
      <slot />
    </div>
  </section>
</template>
