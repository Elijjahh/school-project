import { questions } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { testId, text } = body;

  if (!testId || !text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'testId and text are required',
    });
  }

  const [question] = await useDrizzle()
    .insert(questions)
    .values({
      testId: Number(testId),
      text,
    })
    .returning();

  return question;
});
