export default defineEventHandler(async (_event) => {
  const users = await useDrizzle().query.users.findMany({});
  return users;
});
