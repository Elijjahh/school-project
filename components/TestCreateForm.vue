<script setup lang="ts">
import { useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';

const props = defineProps<{
  lessonId: number | string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (
    e: 'save',
    payload: {
      maxAttempts: number;
      questions: Array<{ text: string; answers: Array<{ text: string; correct: boolean }> }>;
    },
  ): void;
}>();

// Схемы валидации
const maxAttemptsSchema = toTypedSchema(
  zod.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 1 && num <= 10;
  }, 'Введите число от 1 до 10'),
);

const {
  value: maxAttemptsString,
  errorMessage: maxAttemptsError,
  setValue: setMaxAttemptsString,
} = useField('maxAttempts', maxAttemptsSchema, { initialValue: '3' });

// Создаем отдельный реактивный ref для числа
const maxAttempts = ref(3);

// Синхронизируем строку и число
watch(maxAttempts, (newVal) => {
  setMaxAttemptsString(String(newVal));
});

watch(maxAttemptsString, (newVal) => {
  const num = Number(newVal);
  if (!isNaN(num) && num !== maxAttempts.value) {
    maxAttempts.value = num;
  }
});

// Состояние вопросов
const questions = ref([
  {
    text: '',
    answers: [
      { text: '', correct: true },
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false },
    ],
  },
]);

const saveLoading = ref(false);
const saveError = ref('');

function addQuestion() {
  questions.value.push({
    text: '',
    answers: [
      { text: '', correct: true },
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false },
    ],
  });
}

function removeQuestion(index: number) {
  if (questions.value.length > 1) {
    questions.value.splice(index, 1);
  }
}

function addAnswer(questionIndex: number) {
  if (questions.value[questionIndex].answers.length < 6) {
    questions.value[questionIndex].answers.push({ text: '', correct: false });
  }
}

function removeAnswer(questionIndex: number, answerIndex: number) {
  if (questions.value[questionIndex].answers.length > 2) {
    questions.value[questionIndex].answers.splice(answerIndex, 1);
  }
}

function setCorrectAnswer(questionIndex: number, answerIndex: number) {
  questions.value[questionIndex].answers.forEach((answer, idx) => {
    answer.correct = idx === answerIndex;
  });
}

async function handleSave() {
  saveError.value = '';

  if (maxAttemptsError.value) {
    saveError.value = maxAttemptsError.value;
    return;
  }

  // Валидация вопросов
  for (let i = 0; i < questions.value.length; i++) {
    const question = questions.value[i];
    if (!question.text.trim()) {
      saveError.value = `Вопрос ${i + 1} должен иметь текст`;
      return;
    }

    const hasCorrectAnswer = question.answers.some((answer) => answer.correct);
    if (!hasCorrectAnswer) {
      saveError.value = `Вопрос ${i + 1} должен иметь правильный ответ`;
      return;
    }

    const emptyAnswers = question.answers.filter((answer) => !answer.text.trim());
    if (emptyAnswers.length > 0) {
      saveError.value = `Все ответы в вопросе ${i + 1} должны быть заполнены`;
      return;
    }
  }

  emit('save', {
    maxAttempts: maxAttempts.value,
    questions: questions.value,
  });
}

onMounted(() => {
  setMaxAttemptsString('3');
});
</script>

<template>
  <div class="mt-4 space-y-6 rounded border p-4">
    <div class="space-y-4">
      <FormInput
        :id="`test-max-attempts-${props.lessonId}`"
        v-model="maxAttemptsString"
        type="number"
        label="Максимальное количество попыток"
        placeholder="3"
        :error="maxAttemptsError"
        min="1"
        max="10"
      />

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Вопросы</h3>
          <UIButton type="button" variant="outline" @click="addQuestion">
            Добавить вопрос
          </UIButton>
        </div>

        <div
          v-for="(question, questionIndex) in questions"
          :key="questionIndex"
          class="space-y-3 rounded border p-4"
        >
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">Вопрос {{ questionIndex + 1 }}</label>
            <UIButton
              v-if="questions.length > 1"
              type="button"
              variant="outline"
              size="sm"
              @click="removeQuestion(questionIndex)"
            >
              Удалить
            </UIButton>
          </div>

          <UITextarea v-model="question.text" placeholder="Введите текст вопроса" rows="2" />

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">Варианты ответов</label>
              <UIButton
                v-if="question.answers.length < 6"
                type="button"
                variant="outline"
                size="sm"
                @click="addAnswer(questionIndex)"
              >
                Добавить ответ
              </UIButton>
            </div>

            <div
              v-for="(answer, answerIndex) in question.answers"
              :key="answerIndex"
              class="flex items-center gap-2"
            >
              <input
                type="radio"
                :name="`question-${questionIndex}-correct`"
                :checked="answer.correct"
                @change="setCorrectAnswer(questionIndex, answerIndex)"
                class="shrink-0"
              />
              <UIInput v-model="answer.text" placeholder="Введите вариант ответа" class="flex-1" />
              <UIButton
                v-if="question.answers.length > 2"
                type="button"
                variant="outline"
                size="sm"
                @click="removeAnswer(questionIndex, answerIndex)"
              >
                ×
              </UIButton>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex gap-2">
        <UIButton type="button" :disabled="saveLoading || props.loading" @click="handleSave">
          <span v-if="saveLoading || props.loading" class="flex items-center">
            <span class="mr-2">Создаём...</span>
            <UISpinner class="h-4 w-4" />
          </span>
          <span v-else>Создать тест</span>
        </UIButton>
        <span v-if="saveError" class="text-destructive ml-4 text-sm font-medium">
          {{ saveError }}
        </span>
      </div>
    </div>
  </div>
</template>
