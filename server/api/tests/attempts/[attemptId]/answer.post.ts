import { userAnswers } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const { attemptId } = await getValidatedRouterParams(
    event,
    z.object({
      attemptId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const body = await readBody(event);
  const { questionId, selectedAnswerId } = body;

  if (!questionId || !selectedAnswerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'questionId and selectedAnswerId are required',
    });
  }

  const session = await requireUserSession(event);

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  // Проверяем, что попытка принадлежит пользователю
  const attempt = await useDrizzle().query.testAttempts.findFirst({
    where: (testAttempts, { and, eq }) =>
      and(eq(testAttempts.id, attemptId), eq(testAttempts.userId, session.user.id)),
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

  // Получаем правильный ответ
  const selectedAnswer = await useDrizzle().query.answers.findFirst({
    where: (answers, { eq }) => eq(answers.id, selectedAnswerId),
  });

  if (!selectedAnswer) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Answer not found',
    });
  }

  // Проверяем, что ответ принадлежит к правильному вопросу
  if (selectedAnswer.questionId !== questionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Answer does not belong to the question',
    });
  }

  // Сохраняем ответ пользователя
  const [_userAnswer] = await useDrizzle()
    .insert(userAnswers)
    .values({
      attemptId,
      questionId,
      selectedAnswerId,
      correct: selectedAnswer.correct,
    })
    .returning();

  return {
    success: true,
    correct: selectedAnswer.correct,
  };
});
