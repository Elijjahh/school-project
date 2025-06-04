export default defineNuxtRouteMiddleware((to) => {
  const { user } = useUserSession();

  // Проверяем, начинается ли путь с /admin
  if (to.path.startsWith('/admin')) {
    if (!user.value) {
      return navigateTo('/login');
    }

    if (user.value.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. Admin role required.',
      });
    }
  }
});
