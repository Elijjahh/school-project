import { testAttempts } from '~/drizzle/schema';
import { useDrizzle, eq } from '~/server/utils/drizzle';
import { updateLessonProgress } from '~/server/utils/updateLessonProgress';

export default defineEventHandler(async (event) => {
  const { attemptId } = await getValidatedRouterParams(
    event,
    z.object({
      attemptId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const session = await requireUserSession(event);

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  // Получаем попытку с ответами и информацией о тесте
  const attempt = await useDrizzle().query.testAttempts.findFirst({
    where: (testAttempts, { and, eq }) =>
      and(eq(testAttempts.id, attemptId), eq(testAttempts.userId, session.user.id)),
    with: {
      userAnswers: true,
      test: {
        with: {
          lesson: true,
        },
      },
    },
  });

  if (!attempt) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Attempt not found',
    });
  }

  if (attempt.completed) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Test already completed',
    });
  }

  // Подсчитываем правильные ответы
  const correctAnswers = attempt.userAnswers.filter((answer) => answer.correct);
  const score = correctAnswers.length;
  const percentage = Math.round((score / attempt.totalQuestions) * 100);
  const passed = score >= Math.ceil(attempt.totalQuestions * 0.6); // 60% для прохождения

  // Обновляем попытку
  await useDrizzle()
    .update(testAttempts)
    .set({
      score,
      completed: true,
    })
    .where(eq(testAttempts.id, attemptId));

  // Если тест пройден успешно, обновляем прогресс урока
  if (passed && attempt.test?.lesson) {
    try {
      await updateLessonProgress(attempt.test.lesson.id, session.user.id);
    } catch (error) {
      console.error('Failed to update lesson progress:', error);
      // Не прерываем выполнение, если обновление прогресса не удалось
    }
  }

  return {
    score,
    totalQuestions: attempt.totalQuestions,
    percentage,
    passed,
  };
});
