export default defineEventHandler(async (event) => {
  const { username, email, password, firstName, lastName } = await readBody(event);

  const existingUser = await useDrizzle().query.users.findFirst({
    where: (users, { eq }) => eq(users.username, username),
  });

  if (existingUser) {
    throw createError({ statusCode: 400, message: 'Пользователь уже существует' });
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await useDrizzle()
    .insert(tables.users)
    .values({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
    })
    .returning();

  await setUserSession(event, {
    user: {
      login: newUser[0].username,
    },
    secure: {
      apiToken: '1234567890',
    },
    loggedInAt: new Date(),
  });

  return { success: true };
});
