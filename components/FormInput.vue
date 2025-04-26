<script lang="ts" setup>
defineProps<{
  id: string;
  modelValue: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-gray-900 text-sm leading-[22px] tracking-tight">
      {{ label }}
    </label>
    <UIInput
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :type="type || 'text'"
      :class="{ 'border-red-500': error }"
      :placeholder="placeholder"
    />
    <p v-if="error" class="text-red-500 text-sm leading-[22px]">
      {{ error }}
    </p>
  </div>
</template>
