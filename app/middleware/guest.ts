// app/middleware/guest.ts
// Applied per-page on login & register. If already logged in, redirect to home.

export default defineNuxtRouteMiddleware(async () => {
  const { fetchMe, isLoggedIn, loaded } = useAuth()

  if (!loaded.value) {
    await fetchMe()
  }

  if (isLoggedIn.value) {
    return navigateTo('/')
  }
})