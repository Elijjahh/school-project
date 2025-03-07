import { tests } from '~/drizzle/schema';
import { z } from 'zod';

const bodySchema = z.object({
  exampleId: z.number(),
  historyAttemptsId: z.number(),
  testAttempts: z.number(),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'testId');
  const { exampleId, historyAttemptsId, testAttempts } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const test = await useDrizzle()
    .update(tests)
    .set({ exampleId, historyAttemptsId, testAttempts })
    .where(eq(tests.id, Number(id)))
    .returning();
  return test[0];
});
