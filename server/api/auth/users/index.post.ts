import { users } from '~/drizzle/schema';

const bodySchema = z.object({
  username: z.string(),
  password: z.string().min(8),
  email: z.string().email(),
  firstname: z.string(),
  lastname: z.string(),
});

export default defineEventHandler(async (event) => {
  const { username, email, password, firstname, lastname } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const hashedPassword = await hashPassword(password);

  const user = await useDrizzle()
    .insert(users)
    .values({ username, email, password: hashedPassword, firstname, lastname })
    .returning();
  return user[0];
});
