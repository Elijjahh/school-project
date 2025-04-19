export default defineEventHandler(async (event) => {
  const { username, email, password, firstname, lastname } = await readBody(event);

  const existingUser = await useDrizzle().query.users.findFirst({
    where: (users, { eq }) => eq(users.username, username),
  });

  if (existingUser) {
    throw createError({ statusCode: 409, message: 'Пользователь уже существует' });
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await useDrizzle()
    .insert(tables.users)
    .values({
      username,
      email,
      password: hashedPassword,
      firstname,
      lastname,
    })
    .returning();

  await setUserSession(event, {
    user: {
      login: newUser[0].username,
    },
  });

  return { success: true };
});
