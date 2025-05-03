<script setup lang="ts">
interface Lesson {
  title: string;
}
const form = ref<{
  title: string;
  description: string;
  lessons: Lesson[];
}>({
  title: '',
  description: '',
  lessons: [],
});
const loading = ref(false);
const error = ref('');
const success = ref('');
function addLesson() {
  form.value.lessons.push({ title: '' });
}
function removeLesson(idx: number) {
  form.value.lessons.splice(idx, 1);
}
function createCourse() {
  loading.value = true;
  error.value = '';
  success.value = '';
  setTimeout(() => {
    loading.value = false;
    success.value = 'Курс успешно создан';
  }, 1000);
}
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Создать новый курс</h2>
      <p class="text-muted-foreground">Заполните информацию о курсе и добавьте уроки</p>
    </div>
    <UICard class="max-w-xl">
      <UICardContent>
        <form class="space-y-6" @submit.prevent="createCourse">
          <div class="space-y-2">
            <label class="block mb-1 font-medium">Название курса</label>
            <UIInput
              v-model="form.title"
              class="w-full px-3 py-2 border rounded"
              type="text"
              placeholder="Введите название курса"
            />
          </div>
          <div class="space-y-2">
            <label class="block mb-1 font-medium">Описание</label>
            <UITextarea
              v-model="form.description"
              class="w-full px-3 py-2 border rounded"
              rows="3"
              placeholder="Краткое описание курса"
            />
          </div>
          <div class="space-y-2">
            <label class="block mb-1 font-medium">Уроки</label>
            <ul class="space-y-2">
              <li v-for="(lesson, idx) in form.lessons" :key="idx" class="flex items-center gap-2">
                <UIInput
                  v-model="lesson.title"
                  class="w-full px-3 py-2 border rounded flex-1"
                  type="text"
                  placeholder="Название урока"
                />
                <UIButton type="button" variant="outline" @click="removeLesson(idx)">
                  Удалить
                </UIButton>
              </li>
            </ul>
            <UIButton type="button" variant="secondary" @click="addLesson">
              Добавить урок
            </UIButton>
          </div>
          <div v-if="error" class="text-sm font-medium text-destructive">{{ error }}</div>
          <div v-if="success" class="text-sm font-medium text-primary">{{ success }}</div>
          <div class="flex justify-end">
            <UIButton type="submit" :disabled="loading">
              <span v-if="loading" class="flex items-center">
                <span class="mr-2">Создаём...</span>
                <span
                  class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
              </span>
              <span v-else>Создать курс</span>
            </UIButton>
          </div>
        </form>
      </UICardContent>
    </UICard>
  </div>
</template>
