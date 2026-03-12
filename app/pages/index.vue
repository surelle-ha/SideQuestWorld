<template>
  <div>
  <!-- Inner tab nav (SOS / Quest Board only) -->
    <div class="inner-tabs">
      <button class="inner-tab" :class="{ active: activeTab === 'sos' }" @click="activeTab = 'sos'">
        🆘 Send SOS
      </button>
      <button class="inner-tab" :class="{ active: activeTab === 'board' }" @click="switchToBoard">
        📋 Quest Board
        <span v-if="openCount" class="board-count">{{ openCount }}</span>
      </button>
    </div>
    
    <!-- ══ SOS TAB ══ -->
    <Transition name="tab-fade" mode="out-in">
      <main v-if="activeTab === 'sos'" key="sos" class="sos-card">
        <div class="card-header">
          <div class="sos-tag">🆘 REQUEST HELP</div>
          <h2 class="card-title">Call for Backup</h2>
          <p class="card-desc">Stuck in a dungeon? Boss too tough? Send an SOS and a hero will find you.</p>
        </div>

        <!-- Active quest panel -->
        <Transition name="slide-down">
          <div v-if="activeQuest" class="active-quest-panel">
            <div class="tab-close-warning">
              ⚠️ <strong>Keep this tab open!</strong> Closing it will remove your quest from the board.
            </div>
            <div class="aq-title-row">
              <span class="sos-tag mini" :class="activeQuest.urgency">
                {{ urgencyLevels.find(u => u.value === activeQuest.urgency)?.emoji }}
                {{ activeQuest.urgency.toUpperCase() }}
              </span>
              <span v-if="activeQuest.isBoss" class="boss-badge">💀 BOSS FIGHT</span>
              <span class="ticket-chip">{{ activeQuest.ticketId }}</span>
            </div>
            <h3 class="aq-name">{{ activeQuest.username }}</h3>
            <p class="aq-location">🌐 {{ activeQuest.server }} · 📍 {{ activeQuest.map }} · Room {{ activeQuest.roomId }}</p>
            <p v-if="activeQuest.issue" class="aq-issue">"{{ activeQuest.issue }}"</p>
            <div v-if="activeQuest.heroes?.length" class="heroes-row">
              <span class="heroes-label">⚔️ Heroes en route:</span>
              <div class="hero-chips">
                <span v-for="h in activeQuest.heroes" :key="h.id" class="hero-chip">{{ h.username }}</span>
              </div>
            </div>
            <div v-if="activeQuest.status === 'open'" class="aq-actions">
              <button class="complete-btn" @click="openCompleteModal">✅ Mark as Complete</button>
            </div>
            <div v-else class="resolved-row">
              <span class="resolved-badge">🏆 Quest Resolved!</span>
              <p v-if="activeQuest.helpers?.length" class="helpers-text">
                Helped by: <strong>{{ activeQuest.helpers.join(', ') }}</strong>
              </p>
              <button class="reset-btn" @click="resetAll">Send New SOS</button>
            </div>
          </div>
        </Transition>

        <!-- SOS Form -->
        <Transition name="slide-down">
          <form v-if="!activeQuest" class="sos-form" @submit.prevent="submitSOS">
            <!-- Username — locked -->
            <div class="field-group">
              <label class="field-label"><span class="label-icon">🧙</span> Player Username</label>
              <div class="input-wrap">
                <input :value="user?.sqwUsername" type="text" class="field-input field-locked" readonly tabindex="-1" />
                <span class="lock-icon">🔒</span>
              </div>
              <span class="field-hint">Your Side Quest username is used automatically.</span>
            </div>

            <div class="field-group">
              <label class="field-label"><span class="label-icon">🌐</span> Server</label>
              <div class="input-wrap select-wrap">
                <select v-model="form.server" class="field-input field-select" required>
                  <option value="" disabled>Select a server...</option>
                  <option value="Twilly">Twilly</option>
                  <option value="Artix">Artix</option>
                  <option value="Gravelyn">Gravelyn</option>
                  <option value="Sir Ver">Sir Ver</option>
                  <option value="Alteon">Alteon</option>
                  <option value="Yokai (SEA)">Yokai (SEA)</option>
                  <option value="Twig">Twig</option>
                  <option value="Sepulchure">Sepulchure</option>
                  <option value="Safiria">Safiria</option>
                  <option value="Swordhaven (EU)">Swordhaven (EU)</option>
                  <option value="Yorumi">Yorumi</option>
                  <option value="Espada">Espada</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label"><span class="label-icon">🗺️</span> Current Map</label>
              <div class="input-wrap select-wrap">
                <select v-model="form.mapPreset" class="field-input field-select">
                  <option value="other">Other (type below)</option>
                  <option value="Dungeon of Shadows">Dungeon of Shadows</option>
                  <option value="Crystal Caverns">Crystal Caverns</option>
                  <option value="Ember Wastes">Ember Wastes</option>
                  <option value="Frostpeak Summit">Frostpeak Summit</option>
                  <option value="Verdant Wilds">Verdant Wilds</option>
                  <option value="Skyreach Tower">Skyreach Tower</option>
                  <option value="Abyssal Depths">Abyssal Depths</option>
                </select>
              </div>
              <div v-if="form.mapPreset === 'other'" class="input-wrap" style="margin-top:8px">
                <input v-model="form.customMap" type="text" class="field-input" placeholder="Type your map name..." />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label"><span class="label-icon">🚪</span> Room / Instance ID</label>
              <div class="input-wrap">
                <input v-model="form.roomId" type="text" class="field-input" placeholder="e.g. 9090" required />
                <span class="field-hint">Check the bottom-right corner of your screen</span>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label"><span class="label-icon">📢</span> What's the Problem?</label>
              <div class="input-wrap">
                <textarea v-model="form.issue" class="field-input field-textarea"
                  placeholder="Describe what you need help with..." rows="3" maxlength="300"></textarea>
                <span class="char-count">{{ form.issue.length }}/300</span>
              </div>
            </div>

            <div class="urgency-row">
              <span class="field-label"><span class="label-icon">⚡</span> Urgency</span>
              <div class="urgency-pills">
                <button v-for="level in urgencyLevels" :key="level.value" type="button"
                  class="urgency-pill" :class="[`urgency-${level.value}`, { active: form.urgency === level.value }]"
                  @click="form.urgency = level.value">
                  {{ level.emoji }} {{ level.label }}
                </button>
              </div>
            </div>

            <div class="boss-toggle" @click="form.isBoss = !form.isBoss">
              <div class="boss-toggle-inner" :class="{ active: form.isBoss }">
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
                <span class="toggle-label">💀 Boss Fight — need strong heroes</span>
              </div>
            </div>

            <p v-if="formError" class="api-error">⚠️ {{ formError }}</p>

            <button type="submit" class="submit-btn" :class="{ loading: isLoading }">
              <span v-if="!isLoading" class="btn-content"><span class="btn-icon">🆘</span> Send SOS Signal</span>
              <span v-else class="btn-content"><span class="spinner"></span> Sending Signal...</span>
            </button>
          </form>
        </Transition>
      </main>

      <!-- ══ QUEST BOARD TAB ══ -->
      <main v-else key="board" class="board-panel">
        <div class="card-header board-card-header">
          <div class="board-header-left">
            <div class="sos-tag board-tag">📋 LIVE QUEST BOARD</div>
            <h2 class="card-title">Active SOS Requests</h2>
            <p class="card-desc">Browse open distress calls. Commit to help a fellow adventurer.</p>
          </div>
          <div class="board-controls">
            <select v-model="refreshInterval" class="refresh-select" @change="resetAutoRefresh">
              <option :value="0">Manual</option>
              <option :value="10">10s</option>
              <option :value="20">20s</option>
              <option :value="60">1m</option>
            </select>
            <button class="refresh-btn" :class="{ spinning: boardLoading }" @click="loadQuests">
              <span class="refresh-icon">↻</span>
            </button>
            <span v-if="lastRefreshedText" class="last-refreshed">{{ lastRefreshedText }}</span>
          </div>
        </div>

        <div class="filter-bar">
          <button v-for="f in boardFilters" :key="f.value"
            class="filter-pill" :class="{ active: boardFilter === f.value }"
            @click="applyFilter(f.value)">
            {{ f.label }}
          </button>
        </div>

        <div v-if="boardLoading && !quests.length" class="empty-board">
          <div class="empty-icon">⏳</div>
          <p>Loading quests...</p>
        </div>
        <div v-else-if="!quests.length" class="empty-board">
          <div class="empty-icon">🏰</div>
          <p>No active quests right now.<br>The realm is at peace... for now.</p>
        </div>
        <TransitionGroup v-else name="quest-list" tag="div" class="quest-list">
          <div v-for="quest in quests" :key="quest.id" class="quest-card" :class="{ 'boss-quest': quest.isBoss }">
            <div class="qc-top-row">
              <div class="qc-badges">
                <span class="sos-tag mini" :class="quest.urgency">
                  {{ urgencyLevels.find(u => u.value === quest.urgency)?.emoji }}
                  {{ quest.urgency.toUpperCase() }}
                </span>
                <span v-if="quest.isBoss" class="boss-badge small">💀 BOSS</span>
                <span v-if="quest.status === 'resolved'" class="resolved-badge small">✅ RESOLVED</span>
              </div>
              <span class="ticket-chip small">{{ quest.ticketId }}</span>
            </div>
            <div class="qc-body">
              <h3 class="qc-username">{{ quest.username }}</h3>
              <p class="qc-location">🌐 {{ quest.server }} · 📍 {{ quest.map }} · Room {{ quest.roomId }}</p>
              <p v-if="quest.issue" class="qc-issue">"{{ quest.issue }}"</p>
            </div>
            <div v-if="quest.heroes?.length" class="heroes-row" style="margin-top:6px">
              <span class="heroes-label">⚔️</span>
              <div class="hero-chips">
                <span v-for="h in quest.heroes" :key="h.id" class="hero-chip">{{ h.username }}</span>
              </div>
            </div>
            <div v-if="quest.status === 'resolved' && quest.helpers?.length" class="qc-helpers">
              🏆 Helped by: <strong>{{ quest.helpers.join(', ') }}</strong>
            </div>
            <div v-if="quest.status === 'open'" class="qc-footer">
              <div v-if="user && quest.username.toLowerCase() === user.sqwUsername.toLowerCase()" class="own-quest-notice">
                🛡️ This is your quest
              </div>
              <template v-else>
                <div v-if="commitingId !== quest.id" class="commit-area">
                  <input v-model="commitNames[quest.id]" type="text" class="field-input commit-input"
                    :placeholder="user?.sqwUsername || 'Your username...'" @click.stop />
                  <button class="commit-btn" @click="commitToQuest(quest)">⚔️ Commit</button>
                </div>
                <div v-else class="committing-msg">
                  <span class="spinner small"></span> Joining quest...
                </div>
                            </template>
            </div>
            <div class="qc-time-row">
              <span class="qc-time">{{ timeAgo(quest.createdAt) }}</span>
              <button v-if="quest.status === 'open'" class="copy-join-btn"
                :class="{ copied: copiedId === quest.id }" @click="copyJoin(quest)">
                {{ copiedId === quest.id ? '✓ Copied' : '📋 /join' }}
              </button>
            </div>
          </div>
        </TransitionGroup>
      </main>
    </Transition>

    <!-- Complete Quest Modal -->
    <Transition name="modal-fade">
      <div v-if="showCompleteModal" class="modal-backdrop" @click.self="showCompleteModal = false">
        <div class="modal">
          <div class="modal-icon">🏆</div>
          <h3 class="modal-title">Quest Complete!</h3>
          <p class="modal-desc">Tag the heroes who helped you win.</p>
          <div class="helper-input-row">
            <input v-model="helperInput" type="text" class="field-input"
              placeholder="Hero's username..." @keydown.enter.prevent="addHelper" />
            <button class="add-helper-btn" type="button" @click="addHelper">+</button>
          </div>
          <div v-if="helperNames.length" class="helper-chips">
            <span v-for="(h, i) in helperNames" :key="i" class="hero-chip removable" @click="helperNames.splice(i, 1)">
              {{ h }} ✕
            </span>
          </div>
          <p v-if="completeError" class="api-error">⚠️ {{ completeError }}</p>
          <div class="modal-actions">
            <button class="modal-cancel" @click="showCompleteModal = false">Cancel</button>
            <button class="modal-confirm" :class="{ loading: completeLoading }" @click="confirmComplete">
              <span v-if="!completeLoading">✅ Complete Quest</span>
              <span v-else class="btn-content"><span class="spinner small"></span> Saving...</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import type { QuestDto } from '~~/types/quest'

definePageMeta({ layout: 'default' })

const { user } = useAuth()

// ── Tabs ──────────────────────────────────────────────────
const activeTab = ref<'sos' | 'board'>('sos')

// ── SOS Form ──────────────────────────────────────────────
const form = reactive({
  server: '', mapPreset: 'other', customMap: '', roomId: '', issue: '',
  urgency: 'medium' as 'low' | 'medium' | 'high', isBoss: false,
})
const isLoading   = ref(false)
const formError   = ref('')
const activeQuest = ref<QuestDto | null>(null)

const urgencyLevels = [
  { value: 'low',    label: 'Chill',    emoji: '🟢' },
  { value: 'medium', label: 'Urgent',   emoji: '🟡' },
  { value: 'high',   label: 'CRITICAL', emoji: '🔴' },
]

function resolvedMap() {
  if (form.customMap.trim()) return form.customMap.trim()
  if (form.mapPreset && form.mapPreset !== 'other') return form.mapPreset
  return 'Unknown Map'
}

async function submitSOS() {
  formError.value = ''
  isLoading.value = true
  try {
    const quest = await $fetch<QuestDto>('/api/sos', {
      method: 'POST',
      body: {
        username: user.value?.sqwUsername,
        server: form.server, map: resolvedMap(), roomId: form.roomId,
        issue: form.issue || undefined, urgency: form.urgency, isBoss: form.isBoss,
      },
    })
    activeQuest.value = quest
  } catch (e: any) {
    formError.value = e?.data?.message || 'Failed to send SOS. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function resetAll() {
  activeQuest.value = null
  Object.assign(form, { server: '', mapPreset: 'other', customMap: '', roomId: '', issue: '', urgency: 'medium', isBoss: false })
}

// ── Restore open quest on mount ───────────────────────────
function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (activeQuest.value && activeQuest.value.status === 'open') {
    e.preventDefault(); e.returnValue = ''
  }
}

onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  if (user.value) {
    try {
      const res = await $fetch<{ quests: QuestDto[] }>('/api/quests', { params: { status: 'open' } })
      const owned = res.quests.find(q => q.username.toLowerCase() === user.value!.sqwUsername.toLowerCase())
      if (owned) activeQuest.value = owned
    } catch {}
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  if (refreshTimer)  clearInterval(refreshTimer)
  if (relativeTimer) clearInterval(relativeTimer)
})

// ── Complete modal ────────────────────────────────────────
const showCompleteModal = ref(false)
const helperInput = ref('')
const helperNames = ref<string[]>([])
const completeLoading = ref(false)
const completeError = ref('')

function openCompleteModal() {
  helperNames.value = activeQuest.value?.heroes?.map(h => h.username) ?? []
  helperInput.value = ''
  completeError.value = ''
  showCompleteModal.value = true
}

function addHelper() {
  const name = helperInput.value.trim()
  if (name && !helperNames.value.includes(name)) helperNames.value.push(name)
  helperInput.value = ''
}

async function confirmComplete() {
  if (!activeQuest.value) return
  completeError.value = ''
  completeLoading.value = true
  try {
    const updated = await $fetch<QuestDto>(`/api/quests/${activeQuest.value.id}/complete`, {
      method: 'PATCH', body: { helpers: helperNames.value },
    })
    activeQuest.value = updated
    showCompleteModal.value = false
    if (activeTab.value === 'board') await loadQuests()
  } catch (e: any) {
    completeError.value = e?.data?.message || 'Failed to complete quest.'
  } finally {
    completeLoading.value = false
  }
}

// ── Quest Board ───────────────────────────────────────────
const quests       = ref<QuestDto[]>([])
const boardTotal   = ref(0)
const boardLoading = ref(false)
const boardFilter  = ref('open')

const openCount = computed(() => quests.value.filter(q => q.status === 'open').length || boardTotal.value)

const refreshInterval   = ref(20)
const lastRefreshed     = ref<Date | null>(null)
const lastRefreshedText = ref('')
let   refreshTimer: ReturnType<typeof setInterval> | null = null
let   relativeTimer: ReturnType<typeof setInterval> | null = null

function updateRelativeTime() {
  if (!lastRefreshed.value) return
  const diff = Math.floor((Date.now() - lastRefreshed.value.getTime()) / 1000)
  if (diff < 5)  lastRefreshedText.value = 'just now'
  else if (diff < 60) lastRefreshedText.value = `${diff}s ago`
  else lastRefreshedText.value = `${Math.floor(diff / 60)}m ago`
}

function resetAutoRefresh() {
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null }
  if (refreshInterval.value > 0) refreshTimer = setInterval(loadQuests, refreshInterval.value * 1000)
}

const boardFilters = [
  { value: 'open', label: '🔴 Open' }, { value: 'all', label: '📜 All' },
  { value: 'boss', label: '💀 Boss Fights' }, { value: 'resolved', label: '✅ Resolved' },
]

async function loadQuests() {
  boardLoading.value = true
  try {
    const params: Record<string, string> = {}
    if (boardFilter.value === 'boss') { params.status = 'open'; params.boss = 'true' }
    else if (boardFilter.value !== 'all') params.status = boardFilter.value
    const res = await $fetch<{ quests: QuestDto[], total: number }>('/api/quests', { params })
    quests.value = res.quests
    boardTotal.value = res.total
  } catch { quests.value = [] } finally {
    boardLoading.value = false
    lastRefreshed.value = new Date()
    updateRelativeTime()
    if (!relativeTimer) relativeTimer = setInterval(updateRelativeTime, 5000)
  }
}

async function applyFilter(val: string) { boardFilter.value = val; await loadQuests() }

async function switchToBoard() { activeTab.value = 'board'; await loadQuests(); resetAutoRefresh() }

// ── Time ago ──────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// ── Copy join ─────────────────────────────────────────────
const copiedId = ref<string | null>(null)
async function copyJoin(quest: QuestDto) {
  const text = `/join ${quest.map}-${quest.roomId}`
  try { await navigator.clipboard.writeText(text); copiedId.value = quest.id; setTimeout(() => { copiedId.value = null }, 2000) }
  catch { alert(text) }
}

// ── Commit ────────────────────────────────────────────────
const commitNames = reactive<Record<string, string>>({})
const commitingId = ref<string | null>(null)
async function commitToQuest(quest: QuestDto) {
  const name = (commitNames[quest.id] || user.value?.sqwUsername || '').trim()
  if (!name) return
  commitingId.value = quest.id
  try {
    const updated = await $fetch<QuestDto>(`/api/heroes/${quest.id}`, { method: 'POST', body: { username: name } })
    const idx = quests.value.findIndex(q => q.id === quest.id)
    if (idx !== -1) quests.value[idx] = updated
    commitNames[quest.id] = ''
  } catch (e: any) { alert(e?.data?.message || 'Could not commit to quest.') }
  finally { commitingId.value = null }
}
</script>

<style scoped>
/* ── Inner tab switcher (SOS / Quest Board only) ── */
.inner-tabs {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(196,181,253,.12);
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 20px;
  width: fit-content;
}
.inner-tab {
  background: transparent;
  border: none;
  border-radius: 7px;
  padding: 7px 18px;
  font-family: 'Nunito', sans-serif;
  font-size: .82rem;
  font-weight: 700;
  color: #6b5fa0;
  cursor: pointer;
  transition: all .2s;
  position: relative;
  white-space: nowrap;
}
.inner-tab:hover { color: #c4b5fd; }
.inner-tab.active { background: linear-gradient(135deg,rgba(124,58,237,.35),rgba(168,85,247,.2)); color: #c4b5fd; }
.board-count { position: absolute; top: -4px; right: -4px; background: #dc2626; color: #fff; font-size: .6rem; font-weight: 800; border-radius: 10px; padding: 1px 5px; line-height: 1.2; }

/* ── Cards ── */
.sos-card, .board-panel { background: rgba(255,255,255,.03); border: 1px solid rgba(196,181,253,.12); border-radius: 20px; padding: 32px; backdrop-filter: blur(16px); box-shadow: 0 32px 80px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06); }
@media (max-width: 520px) { .sos-card, .board-panel { padding: 20px 16px; } }
.card-header { margin-bottom: 28px; }
.board-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.board-header-left { flex: 1; min-width: 0; }
.sos-tag { display: inline-block; background: linear-gradient(135deg,rgba(220,38,38,.25),rgba(251,113,133,.15)); border: 1px solid rgba(252,165,165,.3); color: #fca5a5; font-size: .68rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 10px; }
.sos-tag.board-tag { background: linear-gradient(135deg,rgba(234,179,8,.2),rgba(251,191,36,.1)); border-color: rgba(251,191,36,.3); color: #fbbf24; }
.sos-tag.mini { font-size: .62rem; padding: 2px 9px; margin: 0; }
.sos-tag.low    { background: rgba(16,185,129,.15); border-color: rgba(16,185,129,.3); color: #34d399; }
.sos-tag.medium { background: rgba(234,179,8,.12); border-color: rgba(234,179,8,.3); color: #facc15; }
.sos-tag.high   { background: rgba(220,38,38,.2); border-color: rgba(252,165,165,.3); color: #fca5a5; }
.card-title { font-family: 'Cinzel', serif; font-size: 1.8rem; font-weight: 900; background: linear-gradient(135deg,#e2d9f3,#c4b5fd 50%,#f0abfc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0 0 8px; }
.card-desc { color: #8b80a8; font-size: .9rem; line-height: 1.6; }

/* ── Form ── */
.tab-close-warning { background: rgba(234,179,8,.1); border: 1px solid rgba(234,179,8,.3); border-radius: 10px; padding: 10px 14px; font-size: .8rem; color: #fbbf24; margin-bottom: 16px; line-height: 1.5; }
.sos-form { display: flex; flex-direction: column; gap: 20px; }
.field-group { display: flex; flex-direction: column; gap: 8px; }
.field-label { font-size: .8rem; font-weight: 700; color: #8b80a8; text-transform: uppercase; letter-spacing: .08em; display: flex; align-items: center; gap: 6px; }
.label-icon { font-size: 1rem; }
.input-wrap { position: relative; }
.field-input { width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(196,181,253,.15); border-radius: 10px; padding: 12px 16px; font-family: 'Nunito', sans-serif; font-size: .92rem; color: #e8e4f0; outline: none; transition: all .2s; }
.field-input:focus { border-color: rgba(196,181,253,.4); background: rgba(255,255,255,.07); box-shadow: 0 0 0 3px rgba(124,58,237,.12); }
.field-locked { background: rgba(255,255,255,.02) !important; color: #5c5278 !important; cursor: default; border-color: rgba(196,181,253,.08) !important; padding-right: 40px; }
.field-locked:focus { box-shadow: none !important; border-color: rgba(196,181,253,.08) !important; }
.lock-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: .9rem; opacity: .5; pointer-events: none; }
.field-select { appearance: none; cursor: pointer; background: rgba(255,255,255,.05); color: #e8e4f0; padding-right: 36px; }
.select-wrap::after { content: '▾'; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #7c6fa0; pointer-events: none; }
.field-select option { background: #1a1530; color: #e8e4f0; }
.field-textarea { resize: vertical; min-height: 80px; }
.field-hint { font-size: .72rem; color: #5c5278; margin-top: 2px; }
.char-count { position: absolute; bottom: 8px; right: 12px; font-size: .68rem; color: #5c5278; }
.urgency-row { display: flex; flex-direction: column; gap: 10px; }
.urgency-pills { display: flex; gap: 8px; flex-wrap: wrap; }
.urgency-pill { background: rgba(255,255,255,.04); border: 1px solid rgba(196,181,253,.12); border-radius: 20px; padding: 8px 18px; font-family: 'Nunito', sans-serif; font-size: .82rem; font-weight: 700; color: #6b5fa0; cursor: pointer; transition: all .2s; }
.urgency-pill.urgency-low.active   { background: rgba(16,185,129,.2); border-color: rgba(16,185,129,.4); color: #34d399; }
.urgency-pill.urgency-medium.active { background: rgba(234,179,8,.15); border-color: rgba(234,179,8,.4); color: #facc15; }
.urgency-pill.urgency-high.active  { background: rgba(220,38,38,.2); border-color: rgba(252,165,165,.4); color: #fca5a5; }
.boss-toggle { cursor: pointer; }
.boss-toggle-inner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(255,255,255,.03); border: 1px solid rgba(196,181,253,.1); border-radius: 10px; transition: all .2s; }
.boss-toggle-inner.active { background: rgba(220,38,38,.1); border-color: rgba(252,165,165,.25); }
.toggle-track { width: 36px; height: 20px; background: rgba(255,255,255,.1); border-radius: 10px; position: relative; flex-shrink: 0; transition: background .2s; }
.boss-toggle-inner.active .toggle-track { background: rgba(220,38,38,.5); }
.toggle-thumb { position: absolute; width: 14px; height: 14px; background: #fff; border-radius: 50%; top: 3px; left: 3px; transition: transform .2s; }
.boss-toggle-inner.active .toggle-thumb { transform: translateX(16px); }
.toggle-label { font-size: .85rem; font-weight: 600; color: #8b80a8; }
.api-error { color: #fca5a5; font-size: .82rem; background: rgba(220,38,38,.1); border: 1px solid rgba(252,165,165,.2); border-radius: 8px; padding: 8px 14px; }
.submit-btn { background: linear-gradient(135deg,#7c3aed,#a855f7); border: none; border-radius: 12px; padding: 14px 28px; font-family: 'Nunito', sans-serif; font-size: .95rem; font-weight: 800; color: #fff; cursor: pointer; transition: all .25s; box-shadow: 0 8px 24px rgba(124,58,237,.35); }
.submit-btn:hover:not(.loading) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,58,237,.5); }
.submit-btn.loading { background: linear-gradient(135deg,#4c1d95,#6d28d9); cursor: not-allowed; }
.btn-content { display: flex; align-items: center; justify-content: center; gap: 10px; }
.btn-icon { font-size: 1.1rem; }
.spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; flex-shrink: 0; }
.spinner.small { width: 13px; height: 13px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Active quest ── */
.active-quest-panel { background: rgba(196,181,253,.05); border: 1px solid rgba(196,181,253,.2); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 10px; }
.aq-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ticket-chip { background: rgba(196,181,253,.1); border: 1px solid rgba(196,181,253,.2); border-radius: 8px; padding: 2px 10px; font-size: .72rem; font-family: 'Cinzel', serif; color: #c4b5fd; letter-spacing: .08em; }
.ticket-chip.small { font-size: .62rem; padding: 2px 8px; }
.aq-name { font-family: 'Cinzel', serif; font-size: 1.3rem; color: #e2d9f3; }
.aq-location { font-size: .83rem; color: #7c6fa0; }
.aq-issue { font-size: .88rem; color: #a89bc4; font-style: italic; border-left: 2px solid rgba(196,181,253,.25); padding-left: 10px; }
.heroes-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.heroes-label { font-size: .75rem; color: #7c6fa0; font-weight: 700; }
.hero-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.hero-chip { background: rgba(124,58,237,.2); border: 1px solid rgba(196,181,253,.25); border-radius: 20px; padding: 3px 12px; font-size: .75rem; color: #c4b5fd; font-weight: 600; }
.hero-chip.removable { cursor: pointer; transition: all .15s; }
.hero-chip.removable:hover { background: rgba(220,38,38,.2); border-color: rgba(252,165,165,.3); color: #fca5a5; }
.aq-actions { margin-top: 4px; }
.complete-btn { background: linear-gradient(135deg,rgba(16,185,129,.2),rgba(5,150,105,.15)); border: 1px solid rgba(16,185,129,.4); border-radius: 10px; padding: 10px 22px; font-family: 'Nunito', sans-serif; font-size: .88rem; font-weight: 700; color: #34d399; cursor: pointer; transition: all .2s; }
.complete-btn:hover { background: linear-gradient(135deg,rgba(16,185,129,.32),rgba(5,150,105,.25)); transform: translateY(-1px); }
.resolved-row { display: flex; flex-direction: column; gap: 8px; }
.resolved-badge { display: inline-block; background: rgba(16,185,129,.15); border: 1px solid rgba(16,185,129,.3); color: #34d399; border-radius: 20px; padding: 4px 14px; font-size: .78rem; font-weight: 700; }
.resolved-badge.small { font-size: .62rem; padding: 2px 8px; }
.helpers-text { font-size: .85rem; color: #9ca3af; }
.helpers-text strong { color: #c4b5fd; }
.reset-btn { background: transparent; border: 1px solid rgba(196,181,253,.3); border-radius: 8px; padding: 8px 22px; color: #c4b5fd; font-family: 'Nunito', sans-serif; font-size: .85rem; font-weight: 700; cursor: pointer; transition: all .2s; align-self: flex-start; }
.reset-btn:hover { background: rgba(196,181,253,.08); }

/* ── Board ── */
.filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; }
.filter-pill { background: rgba(255,255,255,.04); border: 1px solid rgba(196,181,253,.12); border-radius: 20px; padding: 6px 16px; font-family: 'Nunito', sans-serif; font-size: .78rem; font-weight: 700; color: #6b5fa0; cursor: pointer; transition: all .2s; }
.filter-pill:hover { border-color: rgba(196,181,253,.3); color: #c4b5fd; }
.filter-pill.active { background: rgba(124,58,237,.2); border-color: rgba(196,181,253,.4); color: #c4b5fd; }
.board-controls { display: flex; align-items: center; gap: 6px; flex-shrink: 0; padding-top: 4px; }
.refresh-select { background: rgba(255,255,255,.05); border: 1px solid rgba(196,181,253,.15); border-radius: 8px; padding: 5px 10px; font-family: 'Nunito', sans-serif; font-size: .75rem; font-weight: 700; color: #c4b5fd; cursor: pointer; outline: none; }
.refresh-select option { background: #1a1530; color: #e8e4f0; }
.refresh-btn { background: rgba(196,181,253,.1); border: 1px solid rgba(196,181,253,.2); border-radius: 8px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; color: #c4b5fd; }
.refresh-btn:hover { background: rgba(196,181,253,.2); }
.refresh-icon { font-size: 1.1rem; font-weight: 700; display: inline-block; }
.refresh-btn.spinning .refresh-icon { animation: spin .7s linear infinite; }
.last-refreshed { font-size: .68rem; color: #4b4569; white-space: nowrap; }
.empty-board { text-align: center; padding: 48px 20px; color: #5c5278; }
.empty-icon { font-size: 3rem; margin-bottom: 12px; }
.empty-board p { font-size: .9rem; line-height: 1.7; }
.quest-list { display: flex; flex-direction: column; gap: 14px; }
.quest-card { background: rgba(255,255,255,.03); border: 1px solid rgba(196,181,253,.1); border-radius: 14px; padding: 18px 20px; display: flex; flex-direction: column; gap: 8px; transition: border-color .2s; }
.quest-card:hover { border-color: rgba(196,181,253,.22); }
.quest-card.boss-quest { border-color: rgba(252,165,165,.2); background: rgba(220,38,38,.04); }
.qc-top-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.qc-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.boss-badge { background: rgba(220,38,38,.15); border: 1px solid rgba(252,165,165,.25); color: #fca5a5; border-radius: 20px; padding: 3px 10px; font-size: .72rem; font-weight: 700; }
.boss-badge.small { font-size: .62rem; padding: 2px 8px; }
.qc-body { display: flex; flex-direction: column; gap: 4px; }
.qc-username { font-family: 'Cinzel', serif; font-size: 1rem; color: #e2d9f3; }
.qc-location { font-size: .78rem; color: #7c6fa0; }
.qc-issue { font-size: .83rem; color: #a89bc4; font-style: italic; }
.qc-helpers { font-size: .8rem; color: #7c6fa0; }
.qc-helpers strong { color: #c4b5fd; }
.qc-footer { border-top: 1px solid rgba(196,181,253,.08); padding-top: 12px; }
.commit-area { display: flex; gap: 8px; }
.commit-input { flex: 1; padding: 9px 14px; font-size: .85rem; }
.commit-btn { background: linear-gradient(135deg,rgba(124,58,237,.3),rgba(168,85,247,.2)); border: 1px solid rgba(196,181,253,.3); border-radius: 10px; padding: 9px 16px; font-family: 'Nunito', sans-serif; font-size: .82rem; font-weight: 700; color: #c4b5fd; cursor: pointer; transition: all .2s; white-space: nowrap; }
.commit-btn:hover { background: linear-gradient(135deg,rgba(124,58,237,.45),rgba(168,85,247,.3)); }
.committing-msg { display: flex; align-items: center; gap: 8px; font-size: .82rem; color: #7c6fa0; padding: 8px 0; }
.own-quest-notice { font-size: .78rem; color: #7c6fa0; padding: 8px 0; font-style: italic; }
.qc-time-row { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
.qc-time { font-size: .7rem; color: #4b4569; }
.copy-join-btn { background: rgba(255,255,255,.04); border: 1px solid rgba(196,181,253,.12); border-radius: 6px; padding: 3px 10px; font-size: .7rem; font-family: 'Nunito', sans-serif; font-weight: 700; color: #6b5fa0; cursor: pointer; transition: all .2s; }
.copy-join-btn:hover, .copy-join-btn.copied { background: rgba(124,58,237,.15); border-color: rgba(196,181,253,.3); color: #c4b5fd; }

/* ── Modal ── */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.75); backdrop-filter: blur(6px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal { background: #13102a; border: 1px solid rgba(196,181,253,.2); border-radius: 20px; padding: 32px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 40px 100px rgba(0,0,0,.6); display: flex; flex-direction: column; gap: 14px; }
.modal-icon { font-size: 2.5rem; }
.modal-title { font-family: 'Cinzel', serif; font-size: 1.3rem; color: #e2d9f3; }
.modal-desc { color: #8b80a8; font-size: .88rem; line-height: 1.6; }
.helper-input-row { display: flex; gap: 8px; }
.add-helper-btn { background: linear-gradient(135deg,#7c3aed,#a855f7); border: none; border-radius: 10px; width: 42px; flex-shrink: 0; font-size: 1.2rem; color: #fff; cursor: pointer; }
.helper-chips { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; min-height: 28px; }
.modal-actions { display: flex; gap: 10px; justify-content: center; }
.modal-cancel { background: transparent; border: 1px solid rgba(196,181,253,.25); border-radius: 10px; padding: 10px 22px; color: #7c6fa0; font-family: 'Nunito', sans-serif; font-size: .88rem; font-weight: 700; cursor: pointer; }
.modal-confirm { background: linear-gradient(135deg,rgba(124,58,237,.4),rgba(168,85,247,.3)); border: 1px solid rgba(196,181,253,.4); border-radius: 10px; padding: 10px 22px; color: #c4b5fd; font-family: 'Nunito', sans-serif; font-size: .88rem; font-weight: 700; cursor: pointer; }
.modal-confirm:hover:not(:disabled) { background: linear-gradient(135deg,rgba(124,58,237,.55),rgba(168,85,247,.4)); transform: translateY(-1px); }
.modal-confirm:disabled { opacity: .4; cursor: not-allowed; }

/* ── Transitions ── */
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity .2s, transform .2s; }
.tab-fade-enter-from { opacity: 0; transform: translateY(8px); }
.tab-fade-leave-to { opacity: 0; transform: translateY(-8px); }
.slide-down-enter-active, .slide-down-leave-active { transition: all .3s ease; overflow: hidden; }
.slide-down-enter-from { opacity: 0; max-height: 0; }
.slide-down-enter-to { opacity: 1; max-height: 800px; }
.slide-down-leave-to { opacity: 0; max-height: 0; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.quest-list-enter-active { transition: all .3s ease; }
.quest-list-enter-from { opacity: 0; transform: translateY(12px); }
.quest-list-leave-active { transition: all .2s ease; }
.quest-list-leave-to { opacity: 0; }
.quest-list-move { transition: transform .3s ease; }
</style>