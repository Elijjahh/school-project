import { tests } from '~/drizzle/schema';
import { z } from 'zod';

const bodySchema = z.object({
  exampleId: z.number(),
  historyAttemptsId: z.number(),
  testAttempts: z.number(),
});

export default defineEventHandler(async (event) => {
  const { exampleId, historyAttemptsId, testAttempts } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const test = await useDrizzle()
    .insert(tests)
    .values({ exampleId, historyAttemptsId, testAttempts })
    .returning();
  return test[0];
});
