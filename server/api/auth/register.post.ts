export default defineEventHandler(async (event) => {
  const { username, email, password, firstname, lastname } = await readBody(event);

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
