<template>
  <div class="auth-wrapper">
    <div class="bg-layer">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-icon">⚔️</span>
          <h1 class="logo-title">Side Quest World</h1>
          <p class="logo-sub">Join the realm of heroes</p>
        </div>

        <div class="security-notice">
          🔒 <strong>Important:</strong> Do NOT use your in-game password or in-game username for your Side Quest account. Keep them separate for your security.
        </div>

        <form class="auth-form" @submit.prevent="handleRegister">

          <!-- SQW Username -->
          <div class="field-group">
            <label class="field-label"><span class="label-icon">🧙</span> Side Quest Username <span class="permanent-badge">PERMANENT</span></label>
            <div class="input-wrap">
              <input
                v-model="form.sqwUsername"
                type="text"
                class="field-input"
                placeholder="Choose wisely — cannot be changed"
                autocomplete="username"
                maxlength="20"
                required
              />
              <span v-if="form.sqwUsername" class="char-count">{{ form.sqwUsername.length }}/20</span>
            </div>
            <span class="field-hint">3–20 characters, letters/numbers/underscores only. This is your permanent identity.</span>
          </div>

          <!-- Email -->
          <div class="field-group">
            <label class="field-label"><span class="label-icon">📧</span> Email</label>
            <input v-model="form.email" type="email" class="field-input" placeholder="your@email.com" autocomplete="email" required />
          </div>

          <!-- In-Game Username -->
          <div class="field-group">
            <label class="field-label">
              <span class="label-icon">🎮</span> In-Game Username
              <span class="changeable-badge">CAN CHANGE</span>
            </label>
            <input
              v-model="form.ingameUsername"
              type="text"
              class="field-input"
              placeholder="Your current in-game name (NOT your password!)"
              required
            />
            <span class="field-hint">⚠️ Do not use your in-game password here — this is just your character name.</span>
          </div>

          <!-- Password -->
          <div class="field-group">
            <label class="field-label"><span class="label-icon">🔑</span> Password</label>
            <div class="input-wrap">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="field-input"
                placeholder="Create a strong, unique password"
                autocomplete="new-password"
                required
                minlength="8"
              />
              <button type="button" class="eye-btn" @click="showPassword = !showPassword" tabindex="-1">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <div class="password-strength" v-if="form.password">
              <div class="strength-bar">
                <div class="strength-fill" :class="passwordStrength.cls" :style="{ width: passwordStrength.pct + '%' }"></div>
              </div>
              <span class="strength-label" :class="passwordStrength.cls">{{ passwordStrength.label }}</span>
            </div>
          </div>

          <p v-if="error" class="api-error">⚠️ {{ error }}</p>

          <button type="submit" class="auth-btn" :class="{ loading: isLoading }" :disabled="isLoading">
            <span v-if="!isLoading" class="btn-content">
              <span class="btn-icon">🌟</span> Begin Your Quest
            </span>
            <span v-else class="btn-content">
              <span class="spinner"></span> Creating account...
            </span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <NuxtLink to="/login" class="auth-link">Sign in</NuxtLink></p>
          <NuxtLink to="/" class="back-link">← Back to Side Quest World</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest', layout: 'auth' })

const { register } = useAuth()
const router = useRouter()

const form = reactive({
  sqwUsername: '',
  email: '',
  ingameUsername: '',
  password: '',
})
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')

useHead({ title: 'Register — Side Quest World' })

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return { pct: 0, cls: '', label: '' }
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { pct: 20, cls: 'weak', label: 'Weak' }
  if (score <= 2) return { pct: 40, cls: 'fair', label: 'Fair' }
  if (score <= 3) return { pct: 65, cls: 'good', label: 'Good' }
  if (score <= 4) return { pct: 85, cls: 'strong', label: 'Strong' }
  return { pct: 100, cls: 'epic', label: 'Epic! 🔥' }
})

async function handleRegister() {
  error.value = ''
  isLoading.value = true
  try {
    await register({
      sqwUsername: form.sqwUsername.trim(),
      email: form.email.trim(),
      ingameUsername: form.ingameUsername.trim(),
      password: form.password,
    })
    await router.push('/')
  } catch (e: any) {
    error.value = e?.data?.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Nunito:wght@400;600;700;800&display=swap');

* { box-sizing: border-box; }

.auth-wrapper {
  min-height: 100vh;
  background: #0d0b1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Nunito', sans-serif;
  position: relative;
  padding: 24px 20px;
}

.bg-layer { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .35; }
.orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, #7c3aed, transparent 70%); top: -10%; left: -10%; animation: drift1 18s ease-in-out infinite; }
.orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, #a855f7, transparent 70%); bottom: -5%; right: -5%; animation: drift2 22s ease-in-out infinite; }
.orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, #6d28d9, transparent 70%); top: 40%; left: 40%; animation: drift3 15s ease-in-out infinite; }
.grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(196,181,253,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(196,181,253,.03) 1px, transparent 1px); background-size: 40px 40px; }
@keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px, 20px) scale(1.05); } }
@keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px, -30px) scale(1.08); } }
@keyframes drift3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(15px, -15px) scale(0.95); } }

.auth-container { position: relative; z-index: 1; width: 100%; max-width: 460px; }

.auth-card {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(196,181,253,.15);
  border-radius: 24px;
  padding: 36px;
  backdrop-filter: blur(20px);
  box-shadow: 0 32px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06);
}

.auth-logo { text-align: center; margin-bottom: 24px; }
.logo-icon { font-size: 2.2rem; }
.logo-title {
  font-family: 'Cinzel', serif; font-size: 1.5rem; font-weight: 900;
  background: linear-gradient(135deg, #e2d9f3, #c4b5fd 50%, #f0abfc);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  margin: 6px 0 4px;
}
.logo-sub { color: #7c6fa0; font-size: .85rem; margin: 0; }

.security-notice {
  background: rgba(234,179,8,.08); border: 1px solid rgba(234,179,8,.25);
  border-radius: 10px; padding: 10px 14px; font-size: .78rem; color: #fbbf24;
  margin-bottom: 22px; line-height: 1.6;
}
.security-notice strong { color: #fde68a; }

.auth-form { display: flex; flex-direction: column; gap: 16px; }

.field-group { display: flex; flex-direction: column; gap: 7px; }
.field-label {
  font-size: .75rem; font-weight: 700; color: #8b80a8;
  text-transform: uppercase; letter-spacing: .08em;
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
}
.label-icon { font-size: .9rem; }

.permanent-badge {
  background: rgba(220,38,38,.2); border: 1px solid rgba(252,165,165,.3);
  color: #fca5a5; border-radius: 6px; padding: 1px 7px;
  font-size: .62rem; letter-spacing: .1em;
}
.changeable-badge {
  background: rgba(16,185,129,.15); border: 1px solid rgba(16,185,129,.3);
  color: #34d399; border-radius: 6px; padding: 1px 7px;
  font-size: .62rem; letter-spacing: .1em;
}

.input-wrap { position: relative; }
.field-input {
  width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(196,181,253,.15);
  border-radius: 10px; padding: 12px 44px 12px 16px;
  font-family: 'Nunito', sans-serif; font-size: .92rem; color: #e8e4f0;
  outline: none; transition: all .2s;
}
.field-input:focus {
  border-color: rgba(196,181,253,.4); background: rgba(255,255,255,.07);
  box-shadow: 0 0 0 3px rgba(124,58,237,.12);
}
.char-count { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: .68rem; color: #5c5278; }
.eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1rem; padding: 4px; line-height: 1; }
.field-hint { font-size: .72rem; color: #5c5278; line-height: 1.5; }

.password-strength { display: flex; align-items: center; gap: 10px; }
.strength-bar { flex: 1; height: 4px; background: rgba(255,255,255,.08); border-radius: 2px; overflow: hidden; }
.strength-fill { height: 100%; border-radius: 2px; transition: width .3s, background .3s; }
.strength-fill.weak   { background: #ef4444; }
.strength-fill.fair   { background: #f97316; }
.strength-fill.good   { background: #eab308; }
.strength-fill.strong { background: #22c55e; }
.strength-fill.epic   { background: linear-gradient(90deg, #a855f7, #ec4899); }
.strength-label { font-size: .72rem; font-weight: 700; white-space: nowrap; }
.strength-label.weak   { color: #ef4444; }
.strength-label.fair   { color: #f97316; }
.strength-label.good   { color: #eab308; }
.strength-label.strong { color: #22c55e; }
.strength-label.epic   { color: #f0abfc; }

.api-error { color: #fca5a5; font-size: .82rem; background: rgba(220,38,38,.1); border: 1px solid rgba(252,165,165,.2); border-radius: 8px; padding: 10px 14px; margin: 0; }

.auth-btn {
  background: linear-gradient(135deg, #7c3aed, #a855f7); border: none; border-radius: 12px;
  padding: 14px 28px; font-family: 'Nunito', sans-serif; font-size: .95rem;
  font-weight: 800; color: #fff; cursor: pointer; transition: all .25s;
  box-shadow: 0 8px 24px rgba(124,58,237,.35); margin-top: 6px;
}
.auth-btn:hover:not(.loading):not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,58,237,.5); }
.auth-btn.loading, .auth-btn:disabled { background: linear-gradient(135deg, #4c1d95, #6d28d9); cursor: not-allowed; }
.btn-content { display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-icon { font-size: 1rem; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }

.auth-footer { text-align: center; margin-top: 22px; display: flex; flex-direction: column; gap: 10px; }
.auth-footer p { color: #7c6fa0; font-size: .85rem; margin: 0; }
.auth-link { color: #c4b5fd; font-weight: 700; text-decoration: none; }
.auth-link:hover { color: #f0abfc; }
.back-link { color: #5c5278; font-size: .8rem; text-decoration: none; }
.back-link:hover { color: #8b80a8; }
</style>