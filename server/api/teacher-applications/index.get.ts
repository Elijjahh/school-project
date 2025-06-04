export default defineEventHandler(async (event) => {
  // Проверяем, что пользователь является администратором
  requireAdmin(event);

  const applications = await useDrizzle().query.teacherApplications.findMany({
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          email: true,
          firstname: true,
          lastname: true,
          image: true,
          bio: true,
        },
      },
    },
    orderBy: (teacherApplications, { desc }) => [desc(teacherApplications.createdAt)],
  });

  return {
    applications,
    total: applications.length,
  };
});
