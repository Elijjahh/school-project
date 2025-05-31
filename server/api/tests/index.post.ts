import { tests } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { lessonId } = body;

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
    })
    .returning();
  return test;
});
