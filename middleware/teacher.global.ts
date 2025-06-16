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
  const teacherOnlyRoutes = ['/app/settings'];

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
  }
});
