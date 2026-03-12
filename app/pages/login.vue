<template>
  <div class="auth-card">
    <div class="auth-logo">
      <span class="logo-icon">⚔️</span>
      <h1 class="logo-title">Side Quest World</h1>
      <p class="logo-sub">Welcome back, adventurer</p>
    </div>

    <div class="security-notice">
      🔒 <strong>Security reminder:</strong> Do NOT use your in-game password for your Side Quest account.
    </div>

    <form class="auth-form" @submit.prevent="handleLogin">
      <div
        class="field-group"
        :class="{ focused: focus.username, filled: !!form.username }"
      >
        <label class="field-label"
          ><span class="label-icon">🧙</span> Side Quest Username</label
        >
        <div class="input-wrap">
          <input
            v-model="form.username"
            type="text"
            class="field-input"
            placeholder="Your permanent SQW username"
            autocomplete="username"
            @focus="focus.username = true"
            @blur="focus.username = false"
            required
          />
        </div>
      </div>

      <div
        class="field-group"
        :class="{ focused: focus.password, filled: !!form.password }"
      >
        <label class="field-label"><span class="label-icon">🔑</span> Password</label>
        <div class="input-wrap">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="field-input"
            placeholder="Your Side Quest password"
            autocomplete="current-password"
            @focus="focus.password = true"
            @blur="focus.password = false"
            required
          />
          <button
            type="button"
            class="eye-btn"
            @click="showPassword = !showPassword"
            tabindex="-1"
          >
            {{ showPassword ? "🙈" : "👁️" }}
          </button>
        </div>
      </div>

      <p v-if="error" class="api-error">⚠️ {{ error }}</p>

      <button
        type="submit"
        class="auth-btn"
        :class="{ loading: isLoading }"
        :disabled="isLoading"
      >
        <span v-if="!isLoading" class="btn-content"
          ><span class="btn-icon">⚔️</span> Enter the Realm</span
        >
        <span v-else class="btn-content"
          ><span class="spinner"></span> Authenticating...</span
        >
      </button>
    </form>

    <div class="auth-footer">
      <p>
        New adventurer?
        <NuxtLink to="/register" class="auth-link">Create your account</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "guest", layout: "auth" });

const { login } = useAuth();
const router = useRouter();

const form = reactive({ username: "", password: "" });
const focus = reactive({ username: false, password: false });
const showPassword = ref(false);
const isLoading = ref(false);
const error = ref("");

useHead({ title: "Login — Side Quest World" });

async function handleLogin() {
  error.value = "";
  isLoading.value = true;
  try {
    await login(form.username.trim(), form.password);
    await router.push("/");
  } catch (e: any) {
    error.value = e?.data?.message || "Login failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.auth-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(196, 181, 253, 0.15);
  border-radius: 24px;
  padding: 40px 36px;
  backdrop-filter: blur(20px);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  color: #e8e4f0;
  font-family: "Nunito", sans-serif;
}
.auth-logo {
  text-align: center;
  margin-bottom: 28px;
}
.logo-icon {
  font-size: 2.5rem;
}
.logo-title {
  font-family: "Cinzel", serif;
  font-size: 1.6rem;
  font-weight: 900;
  background: linear-gradient(135deg, #e2d9f3, #c4b5fd 50%, #f0abfc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 8px 0 4px;
}
.logo-sub {
  color: #7c6fa0;
  font-size: 0.85rem;
  margin: 0;
}
.security-notice {
  background: rgba(234, 179, 8, 0.08);
  border: 1px solid rgba(234, 179, 8, 0.25);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.78rem;
  color: #fbbf24;
  margin-bottom: 24px;
  line-height: 1.5;
}
.security-notice strong {
  color: #fde68a;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.field-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #8b80a8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 6px;
}
.label-icon {
  font-size: 0.9rem;
}
.input-wrap {
  position: relative;
}
.field-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(196, 181, 253, 0.15);
  border-radius: 10px;
  padding: 12px 44px 12px 16px;
  font-family: "Nunito", sans-serif;
  font-size: 0.92rem;
  color: #e8e4f0;
  outline: none;
  transition: all 0.2s;
}
.field-input:focus {
  border-color: rgba(196, 181, 253, 0.4);
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}
.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  line-height: 1;
}
.api-error {
  color: #fca5a5;
  font-size: 0.82rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(252, 165, 165, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
  margin: 0;
}
.auth-btn {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-family: "Nunito", sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);
  margin-top: 4px;
  width: 100%;
}
.auth-btn:hover:not(.loading):not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(124, 58, 237, 0.5);
}
.auth-btn.loading,
.auth-btn:disabled {
  background: linear-gradient(135deg, #4c1d95, #6d28d9);
  cursor: not-allowed;
}
.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-icon {
  font-size: 1rem;
}
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.auth-footer {
  text-align: center;
  margin-top: 24px;
}
.auth-footer p {
  color: #7c6fa0;
  font-size: 0.85rem;
  margin: 0;
}
.auth-link {
  color: #c4b5fd;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s;
}
.auth-link:hover {
  color: #f0abfc;
}

/* Validation badges */
.permanent-badge,
.changeable-badge {
  border-radius: 6px;
  padding: 1px 7px;
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  margin-left: 4px;
}
.permanent-badge {
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(252, 165, 165, 0.25);
  color: #fca5a5;
}
.changeable-badge {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}
.field-hint {
  font-size: 0.72rem;
  color: #5c5278;
  margin-top: 2px;
}
.strength-bar {
  height: 3px;
  border-radius: 2px;
  transition: all 0.3s;
  margin-top: 4px;
}
</style>
