// app/middleware/auth.global.ts
// Runs on every route navigation. Redirects to /login if not authenticated.

const PUBLIC_ROUTES = ['/login', '/register']

export default defineNuxtRouteMiddleware(async (to) => {
  // Allow public routes through without any auth check
  if (PUBLIC_ROUTES.includes(to.path)) return

  const { fetchMe, isLoggedIn, loaded } = useAuth()

  // Only fetch once per app session
  if (!loaded.value) {
    await fetchMe()
  }

  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})