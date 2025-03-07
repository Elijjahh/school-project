export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'userId');
  const user = await useDrizzle().query.users.findFirst({
    where: (users, { eq }) => eq(users.id, Number(id)),
  });
  return user;
});
