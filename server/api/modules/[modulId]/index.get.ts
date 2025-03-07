export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'moduleId');
  const module = await useDrizzle().query.modules.findFirst({
    where: (modules, { eq }) => eq(modules.id, Number(id)),
  });
  return module;
});
