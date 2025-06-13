export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'userId');

  // Проверяем, что пользователь может просматривать этого пользователя
  const currentUser = getCurrentUser(event);

  // Админ может просматривать любого пользователя, обычный пользователь только себя
  if (currentUser.role !== 'admin' && currentUser.id !== Number(id)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. You can only view your own profile.',
    });
  }

  const user = await useDrizzle().query.users.findFirst({
    where: (users, { eq }) => eq(users.id, Number(id)),
    columns: {
      id: true,
      username: true,
      email: true,
      firstname: true,
      lastname: true,
      role: true,
      image: true,
      bio: true,
      createdAt: true,
      // Исключаем пароль из результата
    },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    });
  }

  return user;
});
