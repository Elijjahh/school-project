import { testAttempts } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const { testId } = await getValidatedRouterParams(
    event,
    z.object({
      testId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const session = await requireUserSession(event);

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  // Получаем тест с вопросами
  const test = await useDrizzle().query.tests.findFirst({
    where: (tests, { eq }) => eq(tests.id, testId),
    with: {
      questions: {
        with: {
          answers: true,
        },
        orderBy: (questions, { asc }) => [asc(questions.id)],
      },
    },
  });

  if (!test) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Test not found',
    });
  }

  // Проверяем количество попыток пользователя
  const attempts = await useDrizzle().query.testAttempts.findMany({
    where: (testAttempts, { and, eq }) =>
      and(eq(testAttempts.testId, testId), eq(testAttempts.userId, session.user.id)),
  });

  if (attempts.length >= test.maxAttempts && test.maxAttempts > 0) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Maximum attempts reached',
    });
  }

  // Создаем новую попытку
  const [attempt] = await useDrizzle()
    .insert(testAttempts)
    .values({
      testId,
      userId: session.user.id,
      totalQuestions: test.questions.length,
      score: 0,
      completed: false,
    })
    .returning();

  return {
    attemptId: attempt.id,
    totalQuestions: test.questions.length,
    maxAttempts: test.maxAttempts,
    currentAttempt: attempts.length + 1,
  };
});
