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

  // Получаем все попытки пользователя для этого теста
  const attempts = await useDrizzle().query.testAttempts.findMany({
    where: (testAttempts, { and, eq }) =>
      and(eq(testAttempts.testId, testId), eq(testAttempts.userId, session.user.id)),
    orderBy: (testAttempts, { desc }) => [desc(testAttempts.datetime)],
  });

  return {
    attempts,
    totalAttempts: attempts.length,
  };
});
