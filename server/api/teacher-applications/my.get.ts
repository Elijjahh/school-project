export default defineEventHandler(async (event) => {
  const user = getCurrentUser(event);

  const application = await useDrizzle().query.teacherApplications.findFirst({
    where: (teacherApplications, { eq }) => eq(teacherApplications.userId, user.id),
  });

  return application;
});
