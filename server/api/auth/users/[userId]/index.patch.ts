import { users } from '~/drizzle/schema';

const bodySchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'userId');
  const { username, email, firstname, lastname } = await readValidatedBody(event, bodySchema.parse);

  const user = await useDrizzle()
    .update(users)
    .set({ username, email, firstname, lastname })
    .where(eq(users.id, Number(id)))
    .returning();
  return user[0];
});
