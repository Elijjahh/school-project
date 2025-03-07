import { users } from '~/drizzle/schema';
import { z } from 'zod';

const bodySchema = z.object({
  username: z.string(),
  password: z.string().min(8),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
});

export default defineEventHandler(async (event) => {
  const { username, email, password, firstName, lastName } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const hashedPassword = await hashPassword(password);

  const user = await useDrizzle()
    .insert(users)
    .values({ username, email, password: hashedPassword, firstName, lastName })
    .returning();
  return user[0];
});
