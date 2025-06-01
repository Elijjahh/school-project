<script setup lang="ts">
import { useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import type { TestWithQuestions } from '~/drizzle/types';

const props = defineProps<{
  test: TestWithQuestions;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (
    e: 'save',
    payload: {
      maxAttempts: number;
      testQuestions: Array<{ text: string; answers: Array<{ text: string; correct: boolean }> }>;
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
} = useField('maxAttempts', maxAttemptsSchema, { initialValue: String(props.test.maxAttempts) });

// Создаем отдельный реактивный ref для числа
const maxAttempts = ref(props.test.maxAttempts);

// Состояние вопросов
const questions = ref(
  props.test.questions?.map((q) => ({
    text: q.text,
    answers:
      q.answers?.map((a) => ({
        text: a.text,
        correct: a.correct,
      })) || [],
  })) || [],
);

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
    testQuestions: questions.value,
  });
}

// Синхронизация с пропсами
watch(
  () => props.test,
  (newTest) => {
    if (newTest) {
      maxAttempts.value = newTest.maxAttempts;
      setMaxAttemptsString(String(newTest.maxAttempts));
      questions.value =
        newTest.questions?.map((q) => ({
          text: q.text,
          answers:
            q.answers?.map((a) => ({
              text: a.text,
              correct: a.correct,
            })) || [],
        })) || [];
    }
  },
  { immediate: true },
);

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
</script>

<template>
  <div class="space-y-8">
    <!-- Настройки теста -->
    <UICard class="p-6">
      <div class="space-y-4">
        <div class="border-b pb-4">
          <h3 class="text-lg font-semibold text-gray-900">Настройки теста</h3>
          <p class="mt-1 text-sm text-gray-600">Основные параметры тестирования</p>
        </div>

        <div class="max-w-xs">
          <FormInput
            :id="`test-max-attempts-${props.test.id}`"
            v-model="maxAttemptsString"
            type="number"
            label="Максимальное количество попыток"
            placeholder="3"
            :error="maxAttemptsError"
            min="1"
            max="10"
          />
        </div>
      </div>
    </UICard>

    <!-- Вопросы -->
    <UICard class="p-6">
      <div class="space-y-6">
        <div class="border-b pb-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Вопросы теста</h3>
              <p class="mt-1 text-sm text-gray-600">
                Добавьте вопросы с вариантами ответов ({{ questions.length }}
                {{
                  questions.length === 1 ? 'вопрос' : questions.length < 5 ? 'вопроса' : 'вопросов'
                }})
              </p>
            </div>
            <UIButton type="button" variant="outline" class="shrink-0" @click="addQuestion">
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Добавить вопрос
            </UIButton>
          </div>
        </div>

        <div class="space-y-6">
          <div
            v-for="(question, questionIndex) in questions"
            :key="questionIndex"
            class="rounded-lg border border-gray-200 bg-gray-50/30 p-5"
          >
            <!-- Заголовок вопроса -->
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white"
                >
                  {{ questionIndex + 1 }}
                </div>
                <h4 class="font-medium text-gray-900">Вопрос {{ questionIndex + 1 }}</h4>
              </div>
              <UIButton
                v-if="questions.length > 1"
                type="button"
                variant="outline"
                size="sm"
                class="text-red-600 hover:border-red-300 hover:text-red-700"
                @click="removeQuestion(questionIndex)"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </UIButton>
            </div>

            <!-- Текст вопроса -->
            <div class="mb-5">
              <label class="mb-2 block text-sm font-medium text-gray-700"> Текст вопроса </label>
              <UITextarea
                v-model="question.text"
                placeholder="Введите текст вопроса..."
                rows="3"
                class="resize-none"
              />
            </div>

            <!-- Варианты ответов -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700">
                  Варианты ответов
                  <span class="ml-1 text-xs text-gray-500">(выберите правильный)</span>
                </label>
                <UIButton
                  v-if="question.answers.length < 6"
                  type="button"
                  variant="outline"
                  size="sm"
                  class="text-xs"
                  @click="addAnswer(questionIndex)"
                >
                  <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Добавить ответ
                </UIButton>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(answer, answerIndex) in question.answers"
                  :key="answerIndex"
                  class="group relative"
                >
                  <div
                    class="flex items-center gap-3 rounded-lg border bg-white p-3 transition-colors hover:bg-gray-50/50"
                    :class="answer.correct ? 'border-gray-900 bg-gray-50' : 'border-gray-200'"
                  >
                    <!-- Радиокнопка -->
                    <div class="relative flex items-center">
                      <input
                        type="radio"
                        :name="`question-${questionIndex}-correct`"
                        :checked="answer.correct"
                        class="h-4 w-4 border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900"
                        @change="setCorrectAnswer(questionIndex, answerIndex)"
                      />
                      <div class="pointer-events-none absolute inset-0">
                        <div
                          v-if="answer.correct"
                          class="flex h-4 w-4 items-center justify-center rounded-full bg-gray-900"
                        >
                          <div class="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                      </div>
                    </div>

                    <!-- Буква варианта -->
                    <div
                      class="flex h-6 w-6 items-center justify-center rounded border text-xs font-medium"
                      :class="
                        answer.correct
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 bg-gray-100 text-gray-600'
                      "
                    >
                      {{ String.fromCharCode(65 + answerIndex) }}
                    </div>

                    <!-- Поле ввода ответа -->
                    <UIInput
                      v-model="answer.text"
                      placeholder="Введите вариант ответа..."
                      class="flex-1 border-0 bg-transparent p-0 px-2 focus:ring-0"
                    />

                    <!-- Кнопка удаления -->
                    <UIButton
                      v-if="question.answers.length > 2"
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="text-red-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-700"
                      @click="removeAnswer(questionIndex, answerIndex)"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </UIButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UICard>

    <!-- Действия -->
    <div class="flex items-center justify-between border-t py-4">
      <div class="flex items-center gap-4">
        <UIButton
          type="button"
          :disabled="saveLoading || props.loading"
          class="bg-gray-900 text-white hover:bg-gray-800"
          @click="handleSave"
        >
          <svg
            v-if="saveLoading || props.loading"
            class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ saveLoading || props.loading ? 'Сохраняем...' : 'Сохранить тест' }}
        </UIButton>

        <div class="text-xs text-gray-500">
          {{ questions.length }}
          {{ questions.length === 1 ? 'вопрос' : questions.length < 5 ? 'вопроса' : 'вопросов' }} •
          {{ questions.reduce((acc, q) => acc + q.answers.length, 0) }}
          {{ questions.reduce((acc, q) => acc + q.answers.length, 0) === 1 ? 'ответ' : 'ответов' }}
        </div>
      </div>

      <div v-if="saveError" class="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
        {{ saveError }}
      </div>
    </div>
  </div>
</template>
