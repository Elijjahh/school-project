import { tests } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { lessonId, maxAttempts = 3 } = body;

  if (!lessonId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'lessonId is required',
    });
  }

  const [test] = await useDrizzle()
    .insert(tests)
    .values({
      lessonId: Number(lessonId),
      maxAttempts: Number(maxAttempts),
    })
    .returning();
  return test;
});
