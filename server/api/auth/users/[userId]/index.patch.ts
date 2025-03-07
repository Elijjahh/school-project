import { users } from '~/drizzle/schema';
import { z } from 'zod';

const bodySchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'userId');
  const { username, email, firstName, lastName } = await readValidatedBody(event, bodySchema.parse);

  const user = await useDrizzle()
    .update(users)
    .set({ username, email, firstName, lastName })
    .where(eq(users.id, Number(id)))
    .returning();
  return user[0];
});
