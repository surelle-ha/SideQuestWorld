// app/composables/useAuth.ts
export interface AuthUser {
  id: string
  sqwUsername: string
  ingameUsername: string
  email: string
  heroPoints: number
}

const _user = ref<AuthUser | null>(null)
const _loaded = ref(false)

export function useAuth() {
  async function fetchMe() {
    try {
      const data = await $fetch<AuthUser>('/api/auth/me')
      _user.value = data
    } catch {
      _user.value = null
    } finally {
      _loaded.value = true
    }
  }

  async function login(sqwUsername: string, password: string) {
    const data = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { sqwUsername, password },
    })
    _user.value = data.user
    return data.user
  }

  async function register(payload: {
    sqwUsername: string
    email: string
    ingameUsername: string
    password: string
  }) {
    const data = await $fetch<{ user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: payload,
    })
    _user.value = data.user
    return data.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    _user.value = null
    await navigateTo('/login')
  }

  return {
    user: readonly(_user),
    loaded: readonly(_loaded),
    isLoggedIn: computed(() => !!_user.value),
    fetchMe,
    login,
    register,
    logout,
  }
}