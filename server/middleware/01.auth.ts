import type { User } from '~/drizzle/types';

declare module 'h3' {
  interface H3EventContext {
    user: Omit<User, 'password'>;
  }
}

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname;
  if (
    pathname.startsWith('/api') &&
    !['/api/auth/login', '/api/auth/register', '/api/seed'].includes(pathname)
  ) {
    const session = await requireUserSession(event);

    const user = await useDrizzle().query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    // Убираем пароль из сессии
    const { password: _, ...userSessionData } = user;

    await setUserSession(event, {
      user: userSessionData,
    });

    event.context.user = user;
  }
});
