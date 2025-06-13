import { users } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  // Только админы могут удалять пользователей
  requireAdmin(event);

  const id = getRouterParam(event, 'userId');
  const user = await useDrizzle()
    .delete(users)
    .where(eq(users.id, Number(id)))
    .returning();
  return user[0];
});
