const bodySchema = z.object({
  email: z.string(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  const user = await useDrizzle().query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'Такого пользователя не существует',
    });
  }

  const isPasswordValid = await verifyPassword(user.password, password);

  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      message: 'Пароль не верный',
    });
  }

  await setUserSession(event, {
    user: {
      email: user.email,
    },
  });

  return {};
});
