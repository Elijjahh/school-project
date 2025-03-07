export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'testId');
  const test = await useDrizzle().query.tests.findFirst({
    where: (tests, { eq }) => eq(tests.id, Number(id)),
  });
  return test;
});
