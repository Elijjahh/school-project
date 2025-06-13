<script setup lang="ts">
const props = defineProps<{
  initialUrl?: string | null;
}>();
const emit = defineEmits<{
  change: [url: string];
}>();

const imageUrl = ref<string | null>(props.initialUrl || null);
const loading = ref(false);
const error = ref('');

watch(
  () => props.initialUrl,
  (val) => {
    imageUrl.value = val || null;
  },
);

const fileInput = ref<HTMLInputElement | null>(null);

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  loading.value = true;
  error.value = '';
  try {
    const formData = new FormData();
    formData.append('file', file);
    // Use $fetch if available, otherwise fallback to fetch
    let response: { url: string };
    const win = window as unknown as {
      $fetch?: (url: string, opts: Record<string, unknown>) => Promise<{ url: string }>;
    };
    if (typeof win.$fetch === 'function') {
      response = await win.$fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });
    } else {
      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Ошибка загрузки');
      response = await res.json();
    }
    imageUrl.value = response.url;
    emit('change', response.url);
  } catch {
    error.value = 'Ошибка при загрузке изображения';
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <div class="flex items-center gap-4">
    <div class="relative h-24 w-24">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        alt="Course image"
        class="h-full w-full rounded object-cover"
      />
      <ImagePlaceholder v-else class="h-full w-full rounded" />
    </div>
    <div class="space-y-2">
      <UIButton type="button" variant="outline" :disabled="loading" @click="fileInput?.click()">
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
        <span v-if="loading" class="flex items-center"
          ><span class="mr-2">Загружаем...</span
          ><span
            class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        /></span>
        <span v-else>Загрузить изображение</span>
      </UIButton>
      <p class="text-muted-foreground text-sm">JPG, GIF или PNG. Максимальный размер 2MB</p>
      <p v-if="error" class="text-destructive text-sm font-medium">{{ error }}</p>
    </div>
  </div>
</template>
