import { testAttempts } from '~/drizzle/schema';

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

  // Получаем попытку с ответами
  const attempt = await useDrizzle().query.testAttempts.findFirst({
    where: (testAttempts, { and, eq }) =>
      and(eq(testAttempts.id, attemptId), eq(testAttempts.userId, session.user.id)),
    with: {
      userAnswers: true,
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

  // Обновляем попытку
  await useDrizzle()
    .update(testAttempts)
    .set({
      score,
      completed: true,
    })
    .where(eq(testAttempts.id, attemptId));

  return {
    score,
    totalQuestions: attempt.totalQuestions,
    percentage: Math.round((score / attempt.totalQuestions) * 100),
    passed: score >= Math.ceil(attempt.totalQuestions * 0.6), // 60% для прохождения
  };
});
