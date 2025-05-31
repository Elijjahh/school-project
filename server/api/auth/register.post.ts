export default defineEventHandler(async (event) => {
  const bodySchema = z.object({
    username: z.string().min(1, 'Имя пользователя обязательно'),
    email: z.string().email('Неверный формат email'),
    password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
    firstname: z.string().min(1, 'Имя обязательно'),
    lastname: z.string().min(1, 'Фамилия обязательна'),
  });

  const { username, email, password, firstname, lastname } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const existingUser = await useDrizzle().query.users.findFirst({
    where: (users, { eq }) => eq(users.username, username),
  });

  if (existingUser) {
    throw createError({ statusCode: 409, message: 'Пользователь уже существует' });
  }

  const hashedPassword = await hashPassword(password);

  const [user] = await useDrizzle()
    .insert(tables.users)
    .values({
      username,
      email,
      password: hashedPassword,
      firstname,
      lastname,
    })
    .returning();

  // Убираем пароль из сессии
  const { password: _, ...userSessionData } = user;

  await setUserSession(event, {
    user: userSessionData,
  });

  return { success: true };
});
