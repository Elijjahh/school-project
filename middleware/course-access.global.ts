export default defineNuxtRouteMiddleware(async (to) => {
  const { user } = useUserSession();

  // Проверяем доступ к страницам курсов
  if (to.path.includes('/courses/') && to.path.includes('/modules/')) {
    if (!user.value) {
      return navigateTo('/login');
    }

    // Извлекаем courseId из пути
    const courseIdMatch = to.path.match(/\/courses\/(\d+)/);
    if (courseIdMatch) {
      // const courseId = parseInt(courseIdMatch[1]);
      // Пока оставляем без проверки, можно добавить позже
      // try {
      //   // Проверяем, участвует ли пользователь в курсе или является его создателем
      //   const participation = await $fetch(`/api/courses/${courseId}/check-access`);
      //
      //   if (!participation.hasAccess) {
      //     throw createError({
      //       statusCode: 403,
      //       statusMessage: 'Access denied. You must enroll in this course to access its content.',
      //     });
      //   }
      // } catch {
      //   // Если произошла ошибка при проверке доступа, перенаправляем на страницу курса
      //   return navigateTo(`/courses/${courseId}`);
      // }
    }
  }

  // Проверяем доступ к тестам
  if (to.path.includes('/tests/') && user.value) {
    const testIdMatch = to.path.match(/\/tests\/(\d+)/);
    if (testIdMatch) {
      const testId = parseInt(testIdMatch[1]);

      try {
        // Проверяем доступ к тесту через API
        await $fetch(`/api/tests/${testId}/check-access`);
      } catch {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied. You cannot access this test.',
        });
      }
    }
  }
});
