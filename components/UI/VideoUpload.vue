<script setup lang="ts">
interface Props {
  modelValue?: string | null;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  error?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'video/mp4,video/webm,video/ogg',
  maxSizeMB: 100,
  label: 'Загрузить видео',
});

const emit = defineEmits<Emits>();

const uploading = ref(false);
const uploadError = ref('');
const fileInputRef = ref<HTMLInputElement>();

const videoUrl = computed({
  get: () => props.modelValue ?? null,
  set: (value) => {
    emit('update:modelValue', value);
  },
});

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Validate file size
  const maxSizeBytes = props.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    uploadError.value = `Размер файла превышает ${props.maxSizeMB}MB`;
    return;
  }

  // Validate file type
  if (!props.accept.split(',').includes(file.type)) {
    uploadError.value = 'Неподдерживаемый формат файла';
    return;
  }

  uploadError.value = '';
  uploading.value = true;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await $fetch<{ url: string }>('/api/storage/upload', {
      method: 'POST',
      body: formData,
    });

    videoUrl.value = response.url;
  } catch (error: unknown) {
    uploadError.value = (error as Error)?.message || 'Ошибка при загрузке видео';
  } finally {
    uploading.value = false;
  }
}

function removeVideo() {
  // Force emit the change
  emit('update:modelValue', null);

  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

function triggerFileSelect() {
  fileInputRef.value?.click();
}
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="text-sm leading-none font-medium">{{ label }}</label>

    <div v-if="!videoUrl" class="space-y-2">
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Placeholder for first upload with same style as video -->
      <div v-if="!uploading" class="relative">
        <div class="flex h-64 w-full items-center justify-center rounded-lg border bg-gray-100">
          <UIButton type="button" variant="outline" size="lg" @click="triggerFileSelect">
            {{ label }}
          </UIButton>
        </div>
      </div>

      <!-- Loading state for first upload -->
      <div v-else class="relative">
        <div class="flex h-64 w-full items-center justify-center rounded-lg bg-gray-900">
          <div class="text-center text-white">
            <div
              class="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"
            ></div>
            <div class="text-sm">Загружаем видео...</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-2">
      <!-- Video preview with loading overlay - full width -->
      <div class="relative">
        <video
          :src="videoUrl"
          controls
          class="w-full rounded-lg border"
          preload="metadata"
          :class="{ 'opacity-50': uploading }"
        >
          Ваш браузер не поддерживает воспроизведение видео.
        </video>

        <!-- Loading overlay when replacing video -->
        <div
          v-if="uploading"
          class="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-lg bg-black"
        >
          <div class="text-center text-white">
            <div
              class="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"
            ></div>
            <div class="text-sm">Загружаем новое видео...</div>
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <UIButton
          type="button"
          variant="outline"
          size="sm"
          :disabled="uploading"
          @click="triggerFileSelect"
        >
          <span v-if="uploading" class="flex items-center">
            <span class="mr-2">Загружаем...</span>
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          </span>
          <span v-else>Заменить видео</span>
        </UIButton>
        <UIButton
          type="button"
          variant="destructive"
          size="sm"
          :disabled="uploading"
          @click="removeVideo"
        >
          Удалить видео
        </UIButton>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        class="hidden"
        @change="handleFileSelect"
      />
    </div>

    <div v-if="uploadError || error" class="text-destructive text-sm font-medium">
      {{ uploadError || error }}
    </div>
  </div>
</template>
