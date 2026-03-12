<template>
  <div class="app-wrapper">
    <!-- Animated background -->
    <div class="bg-layer">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="app-content">
      <!-- ══ HEADER ══ -->
      <header class="site-header">
        <NuxtLink to="/" class="logo-area">
          <span class="logo-icon">⚔️</span>
          <div>
            <h1 class="logo-title">Side Quest World</h1>
            <p class="logo-sub">Emergency SOS Portal</p>
          </div>
        </NuxtLink>

        <div class="header-right">
          <!-- Account chip + dropdown -->
          <div class="account-wrap" v-if="user" ref="accountWrapRef">
            <button class="player-chip" @click="toggleAccountMenu">
              🧙 {{ user.sqwUsername }} <span class="chip-caret">▾</span>
            </button>
            <Transition name="dropdown-fade">
              <div v-if="showAccountMenu" class="account-dropdown">
                <div class="dropdown-header">
                  <div class="dh-name">{{ user.sqwUsername }}</div>
                  <div class="dh-ingame">🎮 {{ user.ingameUsername }}</div>
                  <div class="dh-points">⭐ {{ user.heroPoints.toLocaleString() }} Hero Points</div>
                </div>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" @click="openManageAccount">
                  <span>⚙️</span> Manage Account
                </button>
                <button class="dropdown-item logout" @click="handleLogout">
                  <span>🚪</span> Logout
                </button>
              </div>
            </Transition>
          </div>

          <!-- Nav tabs -->
          <nav class="tab-switcher">
            <NuxtLink to="/" class="tab-btn" :class="{ active: route.path === '/' }">🆘 SOS</NuxtLink>
            <NuxtLink to="/leaderboard" class="tab-btn">🏆 Leaderboard</NuxtLink>
            <NuxtLink to="/guild-finder" class="tab-btn">⚔️ Guilds</NuxtLink>
            <NuxtLink to="/enhancements" class="tab-btn">📜 Enhancements</NuxtLink>
            <NuxtLink to="/equipment-builder" class="tab-btn">🛡️ Equipment</NuxtLink>
          </nav>
        </div>
      </header>

      <!-- Page content -->
      <slot />

      <!-- Footer -->
      <footer class="site-footer">
        <span>Side Quest World</span>
        <span class="dot">·</span>
        <span>Community Support Portal</span>
        <span class="dot">·</span>
        <span>Heroes Never Quit</span>
      </footer>
    </div>

    <!-- ══ MANAGE ACCOUNT MODAL ══ -->
    <Transition name="modal-fade">
      <div v-if="showManageModal" class="modal-backdrop" @click.self="showManageModal = false">
        <div class="modal manage-modal">
          <div class="modal-icon">⚙️</div>
          <h3 class="modal-title">Manage Account</h3>

          <div class="manage-field-group">
            <label class="field-label">🧙 Side Quest Username</label>
            <div class="input-wrap">
              <input :value="user?.sqwUsername" type="text" class="field-input field-locked" readonly tabindex="-1" />
              <span class="lock-icon">🔒</span>
            </div>
            <span class="field-hint">This cannot be changed.</span>
          </div>

          <div class="manage-field-group">
            <label class="field-label">📧 Email</label>
            <div class="input-wrap">
              <input :value="user?.email" type="text" class="field-input field-locked" readonly tabindex="-1" />
              <span class="lock-icon">🔒</span>
            </div>
          </div>

          <div class="manage-field-group">
            <label class="field-label">🎮 In-Game Username <span class="editable-badge">EDITABLE</span></label>
            <input v-model="newIngameName" type="text" class="field-input" placeholder="Your current in-game name" />
            <span class="field-hint">Update this when you change your in-game name.</span>
          </div>

          <p v-if="manageError" class="api-error">⚠️ {{ manageError }}</p>
          <p v-if="manageSuccess" class="api-success">✅ {{ manageSuccess }}</p>

          <div class="modal-actions">
            <button class="modal-cancel" @click="showManageModal = false">Close</button>
            <button class="modal-confirm" :class="{ loading: manageSaving }"
              :disabled="manageSaving || !newIngameName.trim()" @click="saveIngameName">
              <span v-if="!manageSaving">💾 Save Changes</span>
              <span v-else class="btn-content"><span class="spinner small"></span> Saving...</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { user, logout, fetchMe } = useAuth()
const route = useRoute()

// ── Account dropdown ──────────────────────────────────────
const showAccountMenu = ref(false)
const accountWrapRef  = ref<HTMLElement | null>(null)

function toggleAccountMenu() { showAccountMenu.value = !showAccountMenu.value }

function closeAccountMenu(e: MouseEvent) {
  if (accountWrapRef.value && !accountWrapRef.value.contains(e.target as Node)) {
    showAccountMenu.value = false
  }
}

async function handleLogout() {
  showAccountMenu.value = false
  await logout()
}

// ── Manage Account modal ──────────────────────────────────
const showManageModal = ref(false)
const newIngameName   = ref('')
const manageSaving    = ref(false)
const manageError     = ref('')
const manageSuccess   = ref('')

function openManageAccount() {
  showAccountMenu.value = false
  newIngameName.value   = user.value?.ingameUsername ?? ''
  manageError.value     = ''
  manageSuccess.value   = ''
  showManageModal.value = true
}

async function saveIngameName() {
  if (!newIngameName.value.trim()) return
  manageSaving.value  = true
  manageError.value   = ''
  manageSuccess.value = ''
  try {
    await $fetch('/api/auth/update-profile', {
      method: 'PATCH',
      body: { ingameUsername: newIngameName.value.trim() },
    })
    await fetchMe()
    manageSuccess.value = 'In-game username updated!'
  } catch (e: any) {
    manageError.value = e?.data?.message || 'Failed to save. Try again.'
  } finally {
    manageSaving.value = false
  }
}

onMounted(() => document.addEventListener('click', closeAccountMenu))
onBeforeUnmount(() => document.removeEventListener('click', closeAccountMenu))
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Nunito:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #0a0b14; overflow-x: hidden; }
</style>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  background: #0a0b14;
  font-family: 'Nunito', sans-serif;
  color: #e8e4f0;
  position: relative;
  overflow-x: hidden;
}

/* ── Background ── */
.bg-layer { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.18; animation: drift 14s ease-in-out infinite alternate; }
.orb-1 { width: 520px; height: 520px; background: #7c3aed; top: -120px; left: -100px; }
.orb-2 { width: 400px; height: 400px; background: #db2777; top: 40%; right: -80px; animation-delay: -5s; }
.orb-3 { width: 350px; height: 350px; background: #0ea5e9; bottom: -100px; left: 30%; animation-delay: -9s; }
@keyframes drift { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,20px) scale(1.08); } }
.grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(124,58,237,.06) 1px,transparent 1px), linear-gradient(90deg,rgba(124,58,237,.06) 1px,transparent 1px); background-size: 40px 40px; }

/* ── Content wrapper ── */
.app-content {
  position: relative;
  z-index: 1;
  max-width: 860px;
  margin: 0 auto;
  padding: 28px 20px 60px;
}

/* ── Header ── */
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  text-decoration: none;
}
.logo-icon { font-size: 2rem; filter: drop-shadow(0 0 12px #7c3aed88); }
.logo-title {
  font-family: 'Cinzel', serif;
  font-size: 1.3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #c4b5fd, #f0abfc, #93c5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}
.logo-sub { font-size: .68rem; color: #7c6fa0; letter-spacing: .12em; text-transform: uppercase; }

.header-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* ── Account chip ── */
.account-wrap { position: relative; }
.player-chip {
  background: rgba(196,181,253,.1);
  border: 1px solid rgba(196,181,253,.25);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: .78rem;
  font-weight: 700;
  color: #c4b5fd;
  cursor: pointer;
  transition: all .2s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  font-family: 'Nunito', sans-serif;
}
.player-chip:hover { background: rgba(196,181,253,.18); }
.chip-caret { font-size: .7rem; opacity: .7; }

.account-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 210px;
  background: #13102a;
  border: 1px solid rgba(196,181,253,.2);
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 20px 60px rgba(0,0,0,.6);
  z-index: 200;
}
.dropdown-header { padding: 10px 12px; }
.dh-name { font-family: 'Cinzel', serif; font-size: .88rem; color: #e2d9f3; font-weight: 700; margin-bottom: 4px; }
.dh-ingame { font-size: .75rem; color: #7c6fa0; margin-bottom: 2px; }
.dh-points { font-size: .75rem; color: #c4b5fd; font-weight: 700; }
.dropdown-divider { height: 1px; background: rgba(196,181,253,.1); margin: 6px 0; }
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  border-radius: 8px;
  padding: 9px 12px;
  font-family: 'Nunito', sans-serif;
  font-size: .83rem;
  font-weight: 700;
  color: #a89bc4;
  cursor: pointer;
  transition: all .15s;
  text-align: left;
}
.dropdown-item:hover { background: rgba(196,181,253,.08); color: #e2d9f3; }
.dropdown-item.logout:hover { background: rgba(220,38,38,.1); color: #fca5a5; }
.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: opacity .15s, transform .15s; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateY(-6px); }

/* ── Nav tabs ── */
.tab-switcher {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(196,181,253,.12);
  border-radius: 10px;
  padding: 4px;
  flex-wrap: wrap;
}
.tab-btn {
  background: transparent;
  border: none;
  border-radius: 7px;
  padding: 7px 14px;
  font-family: 'Nunito', sans-serif;
  font-size: .8rem;
  font-weight: 700;
  color: #6b5fa0;
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.tab-btn:hover { color: #c4b5fd; background: rgba(196,181,253,.06); }
.tab-btn.active,
.tab-btn.router-link-active { background: linear-gradient(135deg,rgba(124,58,237,.35),rgba(168,85,247,.2)); color: #c4b5fd; }

/* ── Footer ── */
.site-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 40px;
  font-size: .72rem;
  color: #3d3556;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  flex-wrap: wrap;
}
.dot { color: #5c5278; }

/* ── Manage Account Modal ── */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.75); backdrop-filter: blur(6px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal { background: #13102a; border: 1px solid rgba(196,181,253,.2); border-radius: 20px; padding: 32px; max-width: 420px; width: 100%; box-shadow: 0 40px 100px rgba(0,0,0,.6); display: flex; flex-direction: column; gap: 14px; }
.manage-modal { text-align: left; }
.modal-icon { font-size: 2.2rem; text-align: center; }
.modal-title { font-family: 'Cinzel', serif; font-size: 1.2rem; color: #e2d9f3; text-align: center; }
.manage-field-group { display: flex; flex-direction: column; gap: 7px; }
.field-label { font-size: .75rem; font-weight: 700; color: #8b80a8; text-transform: uppercase; letter-spacing: .08em; display: flex; align-items: center; gap: 6px; }
.input-wrap { position: relative; }
.field-input { width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(196,181,253,.15); border-radius: 10px; padding: 12px 16px; font-family: 'Nunito', sans-serif; font-size: .92rem; color: #e8e4f0; outline: none; transition: all .2s; }
.field-input:focus { border-color: rgba(196,181,253,.4); background: rgba(255,255,255,.07); box-shadow: 0 0 0 3px rgba(124,58,237,.12); }
.field-locked { background: rgba(255,255,255,.02) !important; color: #5c5278 !important; cursor: default; border-color: rgba(196,181,253,.08) !important; padding-right: 40px; }
.field-locked:focus { box-shadow: none !important; border-color: rgba(196,181,253,.08) !important; }
.lock-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: .9rem; opacity: .5; pointer-events: none; }
.editable-badge { background: rgba(16,185,129,.15); border: 1px solid rgba(16,185,129,.3); color: #34d399; border-radius: 6px; padding: 1px 7px; font-size: .62rem; letter-spacing: .1em; }
.field-hint { font-size: .72rem; color: #5c5278; }
.api-error { color: #fca5a5; font-size: .82rem; background: rgba(220,38,38,.1); border: 1px solid rgba(252,165,165,.2); border-radius: 8px; padding: 8px 14px; }
.api-success { color: #34d399; font-size: .82rem; background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.25); border-radius: 8px; padding: 8px 14px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.modal-cancel { background: transparent; border: 1px solid rgba(196,181,253,.25); border-radius: 10px; padding: 10px 22px; color: #7c6fa0; font-family: 'Nunito', sans-serif; font-size: .88rem; font-weight: 700; cursor: pointer; transition: all .2s; }
.modal-confirm { background: linear-gradient(135deg,rgba(124,58,237,.4),rgba(168,85,247,.3)); border: 1px solid rgba(196,181,253,.4); border-radius: 10px; padding: 10px 22px; color: #c4b5fd; font-family: 'Nunito', sans-serif; font-size: .88rem; font-weight: 700; cursor: pointer; transition: all .2s; }
.modal-confirm:hover:not(:disabled) { background: linear-gradient(135deg,rgba(124,58,237,.55),rgba(168,85,247,.4)); transform: translateY(-1px); }
.modal-confirm:disabled { opacity: .4; cursor: not-allowed; }
.btn-content { display: flex; align-items: center; gap: 8px; }
.spinner { border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; flex-shrink: 0; }
.spinner.small { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; }
@keyframes spin { to { transform: rotate(360deg); } }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .header-right { gap: 8px; }
  .tab-switcher { gap: 2px; }
  .tab-btn { padding: 6px 10px; font-size: .72rem; }
  .logo-title { font-size: 1.1rem; }
}
</style>