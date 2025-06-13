import { users } from '~/drizzle/schema';

const bodySchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  image: z.string().optional(),
  bio: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'userId');
  const { username, email, firstname, lastname, image, bio } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  // Проверяем, что пользователь может редактировать эти данные
  const currentUser = getCurrentUser(event);

  // Админ может редактировать любые данные, пользователь только свои
  if (currentUser.role !== 'admin' && currentUser.id !== Number(id)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. You can only edit your own profile.',
    });
  }

  // Check if user exists
  const [existingUser] = await useDrizzle()
    .select()
    .from(users)
    .where(eq(users.id, Number(id)));

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    });
  }

  // Check for unique constraint violations
  if (username || email) {
    const [conflictingUser] = await useDrizzle()
      .select()
      .from(users)
      .where(
        or(
          username ? eq(users.username, username) : undefined,
          email ? eq(users.email, email) : undefined,
        ),
      );

    if (conflictingUser && conflictingUser.id !== Number(id)) {
      throw createError({
        statusCode: 409,
        message: 'Username or email already exists',
      });
    }
  }

  const [user] = await useDrizzle()
    .update(users)
    .set({ username, email, firstname, lastname, image, bio })
    .where(eq(users.id, Number(id)))
    .returning();

  return user;
});
