export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  const authRoutes = ['/login', '/register']

  if (loggedIn.value && authRoutes.includes(to.path)) {
    return navigateTo('/')
  }

  if (!loggedIn.value && !authRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
}) 