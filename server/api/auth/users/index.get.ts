export default defineEventHandler(async (event) => {
  // Только админы могут просматривать список всех пользователей
  requireAdmin(event);

  const users = await useDrizzle().query.users.findMany({
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
  return users;
});
