import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { tests, questions, answers, testAttempts, userAnswers } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const { testId } = await getValidatedRouterParams(
    event,
    z.object({
      testId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  // Проверяем, что пользователь может удалить этот тест
  const user = getCurrentUser(event);
  const db = useDrizzle();

  // Админ может удалить любой тест
  if (user.role !== 'admin') {
    // Получаем тест с информацией об уроке, модуле и курсе
    const test = await db.query.tests.findFirst({
      where: (tests, { eq }) => eq(tests.id, testId),
      with: {
        lesson: {
          with: {
            module: {
              with: {
                course: {
                  columns: { creatorId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!test) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Test not found',
      });
    }

    if (test.lesson.module.course.creatorId !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. You can only delete tests in your own courses.',
      });
    }
  }

  // Используем транзакцию для каскадного удаления
  const result = await db.transaction(async (tx) => {
    // 1. Получаем все вопросы теста
    const testQuestions = await tx
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.testId, testId));

    const questionIds = testQuestions.map((q) => q.id);

    if (questionIds.length > 0) {
      // 2. Удаляем все пользовательские ответы для попыток этого теста
      const attempts = await tx
        .select({ id: testAttempts.id })
        .from(testAttempts)
        .where(eq(testAttempts.testId, testId));

      if (attempts.length > 0) {
        const attemptIds = attempts.map((a) => a.id);
        await tx.delete(userAnswers).where(inArray(userAnswers.attemptId, attemptIds));
      }

      // 3. Удаляем попытки тестов
      await tx.delete(testAttempts).where(eq(testAttempts.testId, testId));

      // 4. Удаляем все ответы к вопросам
      await tx.delete(answers).where(inArray(answers.questionId, questionIds));

      // 5. Удаляем все вопросы
      await tx.delete(questions).where(eq(questions.testId, testId));
    }

    // 6. Удаляем сам тест
    const deletedTest = await tx.delete(tests).where(eq(tests.id, testId)).returning();
    return deletedTest[0];
  });

  return result;
});
