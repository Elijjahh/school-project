export default defineNuxtRouteMiddleware((to) => {
  const { user } = useUserSession();

  // Проверяем доступ к настройкам пользователя
  if (to.path === '/app/settings') {
    if (!user.value) {
      return navigateTo('/login');
    }
    // Любой авторизованный пользователь может зайти в свои настройки
  }

  // Проверяем доступ к созданию курсов и управлению ими
  if (to.path.includes('create-course') || to.path.includes('edit-course')) {
    if (!user.value) {
      return navigateTo('/login');
    }

    if (user.value.role !== 'teacher' && user.value.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. You must be a teacher or admin to create/edit courses.',
      });
    }
  }

  // Проверяем доступ к управлению тестами
  if (to.path.includes('create-test') || to.path.includes('edit-test')) {
    if (!user.value) {
      return navigateTo('/login');
    }

    if (user.value.role !== 'teacher' && user.value.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. You must be a teacher or admin to create/edit tests.',
      });
    }
  }
});
