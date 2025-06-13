<script setup lang="ts">
import { cn } from '~/lib/utils';

const props = defineProps<{ class?: string }>();
</script>

<template>
  <div
    :class="
      cn(
        'relative flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-400 bg-gray-100',
        props.class,
      )
    "
  >
    <svg
      class="absolute inset-0 h-full w-full stroke-gray-400/20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="diagonal-pattern"
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
        </pattern>
      </defs>
      <rect stroke="none" fill="url(#diagonal-pattern)" width="100%" height="100%" />
    </svg>
  </div>
</template>
