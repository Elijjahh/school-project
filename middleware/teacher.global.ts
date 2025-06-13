export default defineNuxtRouteMiddleware((to) => {
  const { user } = useUserSession();

  // Проверяем, начинается ли путь с /instructors (страницы преподавателей)
  if (to.path.startsWith('/instructors')) {
    if (!user.value) {
      return navigateTo('/login');
    }

    // Любой авторизованный пользователь может просматривать страницы преподавателей
    return;
  }

  // Проверяем страницы, которые требуют роль преподавателя или админа
  const teacherRoutes = ['/app/apply-teacher'];
  const teacherOnlyRoutes = ['/app/my-courses', '/app/settings'];

  if (teacherRoutes.includes(to.path)) {
    if (!user.value) {
      return navigateTo('/login');
    }
    // Для заявки на преподавателя - доступ любому авторизованному пользователю
    return;
  }

  if (teacherOnlyRoutes.includes(to.path)) {
    if (!user.value) {
      return navigateTo('/login');
    }

    // Для личных курсов - проверяем только у преподавателей и админов
    if (to.path === '/app/my-courses') {
      if (user.value.role !== 'teacher' && user.value.role !== 'admin') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied. Teacher or admin role required.',
        });
      }
    }
  }
});
