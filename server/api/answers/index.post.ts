import { answers } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { questionId, text, correct } = body;

  if (!questionId || !text || typeof correct !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'questionId, text, and correct are required',
    });
  }

  const [answer] = await useDrizzle()
    .insert(answers)
    .values({
      questionId: Number(questionId),
      text,
      correct,
    })
    .returning();

  return answer;
});
