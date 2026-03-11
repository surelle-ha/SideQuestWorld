<template>
  <div class="sos-wrapper">
    <div class="bg-layer">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="content">
      <header class="site-header">
        <div class="logo-area">
          <span class="logo-icon">⚔️</span>
          <div>
            <h1 class="logo-title">Side Quest World</h1>
            <p class="logo-sub">Emergency SOS Portal</p>
          </div>
        </div>
        <div class="header-right">
          <div class="status-badge">
            <span class="pulse-dot"></span>
            Support Online
          </div>
          <div class="tab-switcher">
            <button class="tab-btn" :class="{ active: activeTab === 'sos' }" @click="activeTab = 'sos'">
              🆘 Send SOS
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'board' }" @click="switchToBoard">
              📋 Quest Board
              <span v-if="openCount" class="board-count">{{ openCount }}</span>
            </button>
          </div>
        </div>
      </header>

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
              <div class="aq-title-row">
                <span class="sos-tag mini" :class="activeQuest.urgency">
                  {{ urgencyLevels.find(u => u.value === activeQuest.urgency)?.emoji }}
                  {{ activeQuest.urgency.toUpperCase() }}
                </span>
                <span v-if="activeQuest.isBoss" class="boss-badge">💀 BOSS FIGHT</span>
                <span class="ticket-chip">{{ activeQuest.ticketId }}</span>
              </div>
              <h3 class="aq-name">{{ activeQuest.username }}</h3>
              <p class="aq-location">📍 {{ activeQuest.map }} · Room {{ activeQuest.roomId }}</p>
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
              <div class="field-group" :class="{ focused: focus.username, filled: form.username }">
                <label class="field-label"><span class="label-icon">🧙</span> Player Username</label>
                <div class="input-wrap">
                  <input v-model="form.username" type="text" class="field-input"
                    placeholder="Enter your in-game name"
                    @focus="focus.username = true" @blur="focus.username = false" required />
                  <span v-if="form.username" class="check-mark">✓</span>
                </div>
              </div>

              <div class="field-group" :class="{ focused: focus.map }">
                <label class="field-label"><span class="label-icon">🗺️</span> Current Map</label>
                <div class="input-wrap select-wrap">
                  <select v-model="form.mapPreset" class="field-input field-select"
                    @focus="focus.map = true" @blur="focus.map = false">
                    <option value="">Select a known map (optional)</option>
                    <optgroup label="⚔️ Battle Zones">
                      <option>Battleon Town</option><option>Dage's Underworld</option>
                      <option>Brightfall</option><option>Mythsong Canyon</option><option>Bludrut Keep</option>
                    </optgroup>
                    <optgroup label="🏰 Dungeons">
                      <option>Death Pit Dungeon</option><option>Swordhaven Dungeon</option>
                      <option>Shadowfall Dungeon</option><option>Chaos Dungeon</option>
                    </optgroup>
                    <optgroup label="🌿 Wilderness">
                      <option>Greenguard Forest</option><option>Oaklore Keep</option>
                      <option>Wastelands</option><option>Lolosia Docks</option>
                    </optgroup>
                    <optgroup label="🌑 Boss Zones">
                      <option>Drakath's Realm</option><option>Chaos Lord Arena</option>
                      <option>Nulgath's Realm</option><option>Lich's Tower</option>
                    </optgroup>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
                <div class="input-wrap" style="margin-top:8px;">
                  <input v-model="form.customMap" type="text" class="field-input"
                    :placeholder="form.mapPreset ? 'Or type a custom map (overrides above)' : 'Custom map name e.g. /join darkfortress'"
                    @focus="focus.map = true" @blur="focus.map = false" />
                  <span class="field-hint">💡 Leave blank to use the selected map above</span>
                </div>
              </div>

              <div class="boss-toggle-row" :class="{ active: form.isBoss }" @click="form.isBoss = !form.isBoss">
                <div class="boss-toggle-left">
                  <span class="boss-icon">💀</span>
                  <div>
                    <div class="boss-toggle-title">Boss Fight</div>
                    <div class="boss-toggle-sub">Toggle if you're fighting a boss enemy</div>
                  </div>
                </div>
                <div class="toggle-track" :class="{ on: form.isBoss }">
                  <div class="toggle-thumb"></div>
                </div>
              </div>

              <div class="field-group" :class="{ focused: focus.roomId, filled: form.roomId }">
                <label class="field-label"><span class="label-icon">🚪</span> Room ID</label>
                <div class="input-wrap">
                  <input v-model="form.roomId" type="text" class="field-input"
                    placeholder="e.g. battleon-1, dungeon-42"
                    @focus="focus.roomId = true" @blur="focus.roomId = false" required />
                  <span class="field-hint">Check the top-right corner of your screen</span>
                </div>
              </div>

              <div class="field-group" :class="{ focused: focus.issue, filled: form.issue }">
                <label class="field-label"><span class="label-icon">📢</span> What's the Problem?</label>
                <div class="input-wrap">
                  <textarea v-model="form.issue" class="field-input field-textarea"
                    placeholder="Describe what you need help with..." rows="3" maxlength="300"
                    @focus="focus.issue = true" @blur="focus.issue = false"></textarea>
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
          <div class="card-header">
            <div class="sos-tag board-tag">📋 LIVE QUEST BOARD</div>
            <h2 class="card-title">Active SOS Requests</h2>
            <p class="card-desc">Browse open distress calls. Enter your name and click <strong>Commit</strong> to help.</p>
          </div>

          <div class="filter-bar">
            <button v-for="f in boardFilters" :key="f.value"
              class="filter-pill" :class="{ active: boardFilter === f.value }"
              @click="applyFilter(f.value)">
              {{ f.label }}
            </button>
          </div>

          <div v-if="boardLoading" class="empty-board">
            <span class="spinner" style="margin:0 auto;display:block;width:28px;height:28px;"></span>
          </div>

          <div v-else-if="!quests.length" class="empty-board">
            <div class="empty-icon">🛡️</div>
            <p>No quests match this filter.<br>The realm is at peace... for now.</p>
          </div>

          <TransitionGroup v-else name="quest-list" tag="div" class="quest-list">
            <div v-for="quest in quests" :key="quest.id"
              class="quest-card" :class="[`urgency-border-${quest.urgency}`, { resolved: quest.status === 'resolved' }]">

              <div class="qc-top">
                <div class="qc-badges">
                  <span class="urgency-dot" :class="`dot-${quest.urgency}`"></span>
                  <span class="qc-urgency">{{ urgencyLevels.find(u => u.value === quest.urgency)?.emoji }} {{ quest.urgency }}</span>
                  <span v-if="quest.isBoss" class="boss-badge small">💀 Boss</span>
                  <span v-if="quest.status === 'resolved'" class="resolved-badge small">✅ Done</span>
                </div>
                <span class="qc-ticket">{{ quest.ticketId }}</span>
              </div>

              <div class="qc-body">
                <div class="qc-player">
                  <span class="qc-avatar">{{ quest.username.charAt(0).toUpperCase() }}</span>
                  <div>
                    <div class="qc-name">{{ quest.username }}</div>
                    <div class="qc-loc">📍 {{ quest.map }} · Room {{ quest.roomId }}</div>
                  </div>
                </div>
                <p v-if="quest.issue" class="qc-issue">"{{ quest.issue }}"</p>
              </div>

              <div v-if="quest.heroes?.length" class="qc-heroes">
                <span class="qc-heroes-label">⚔️ Heroes:</span>
                <div class="hero-chips">
                  <span v-for="h in quest.heroes" :key="h.id" class="hero-chip">{{ h.username }}</span>
                </div>
              </div>

              <div v-if="quest.status === 'resolved' && quest.helpers?.length" class="qc-helpers">
                🏆 Helped by: <strong>{{ quest.helpers.join(', ') }}</strong>
              </div>

              <div v-if="quest.status === 'open'" class="qc-footer">
                <div v-if="commitingId !== quest.id" class="commit-area">
                  <input v-model="commitNames[quest.id]" type="text" class="field-input commit-input"
                    placeholder="Your username to commit..." @click.stop />
                  <button class="commit-btn" @click="commitToQuest(quest)">⚔️ Commit</button>
                </div>
                <div v-else class="committing-msg">
                  <span class="spinner small"></span> Joining quest...
                </div>
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
            <p class="modal-desc">Who came to your aid? Tag the heroes who helped you win.</p>
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

      <footer class="site-footer">
        <span>Side Quest World</span>
        <span class="dot">·</span>
        <span>Community Support Portal</span>
        <span class="dot">·</span>
        <span>Heroes Never Quit</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { QuestDto } from '~~/types/quest'

// ── Tabs ────────────────────────────────────────────────
const activeTab = ref<'sos' | 'board'>('sos')

// ── Form ────────────────────────────────────────────────
const form = reactive({
  username: '',
  mapPreset: '',
  customMap: '',
  roomId: '',
  issue: '',
  urgency: 'medium' as 'low' | 'medium' | 'high',
  isBoss: false,
})

const focus = reactive({ username: false, map: false, roomId: false, issue: false })
const isLoading  = ref(false)
const formError  = ref('')
const activeQuest = ref<QuestDto | null>(null)

const urgencyLevels = [
  { value: 'low',    label: 'Chill',    emoji: '🟢' },
  { value: 'medium', label: 'Urgent',   emoji: '🟡' },
  { value: 'high',   label: 'CRITICAL', emoji: '🔴' },
]

function resolvedMap() {
  if (form.customMap.trim()) return form.customMap.trim()
  if (form.mapPreset) return form.mapPreset
  return 'Unknown Map'
}

async function submitSOS() {
  formError.value = ''
  isLoading.value = true
  try {
    const quest = await $fetch<QuestDto>('/api/sos', {
      method: 'POST',
      body: {
        username: form.username,
        map:      resolvedMap(),
        roomId:   form.roomId,
        issue:    form.issue || undefined,
        urgency:  form.urgency,
        isBoss:   form.isBoss,
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
  Object.assign(form, { username: '', mapPreset: '', customMap: '', roomId: '', issue: '', urgency: 'medium', isBoss: false })
}

// ── Complete modal ───────────────────────────────────────
const showCompleteModal = ref(false)
const helperInput   = ref('')
const helperNames   = ref<string[]>([])
const completeLoading = ref(false)
const completeError   = ref('')

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
      method: 'PATCH',
      body: { helpers: helperNames.value },
    })
    activeQuest.value = updated
    showCompleteModal.value = false
    // Refresh board if visible
    if (activeTab.value === 'board') await loadQuests()
  } catch (e: any) {
    completeError.value = e?.data?.message || 'Failed to complete quest.'
  } finally {
    completeLoading.value = false
  }
}

// ── Quest Board ─────────────────────────────────────────
const quests      = ref<QuestDto[]>([])
const boardTotal  = ref(0)
const boardLoading = ref(false)
const boardFilter  = ref('open')

const openCount = computed(() =>
  quests.value.filter(q => q.status === 'open').length || boardTotal.value
)

const boardFilters = [
  { value: 'open',     label: '🔴 Open' },
  { value: 'all',      label: '📜 All' },
  { value: 'boss',     label: '💀 Boss Fights' },
  { value: 'resolved', label: '✅ Resolved' },
]

async function loadQuests() {
  boardLoading.value = true
  try {
    const params: Record<string, string> = {}
    if (boardFilter.value === 'boss') {
      params.status = 'open'
      params.boss   = 'true'
    } else if (boardFilter.value !== 'all') {
      params.status = boardFilter.value
    }
    const res = await $fetch<{ quests: QuestDto[], total: number }>('/api/quests', { params })
    quests.value     = res.quests
    boardTotal.value = res.total
  } catch {
    quests.value = []
  } finally {
    boardLoading.value = false
  }
}

async function applyFilter(val: string) {
  boardFilter.value = val
  await loadQuests()
}

async function switchToBoard() {
  activeTab.value = 'board'
  await loadQuests()
}

// ── Commit hero ──────────────────────────────────────────
const commitNames  = reactive<Record<string, string>>({})
const commitingId  = ref<string | null>(null)

async function commitToQuest(quest: QuestDto) {
  const name = (commitNames[quest.id] || '').trim()
  if (!name) return
  commitingId.value = quest.id
  try {
    const updated = await $fetch<QuestDto>(`/api/heroes/${quest.id}`, {
      method: 'POST',
      body: { username: name },
    })
    const idx = quests.value.findIndex(q => q.id === quest.id)
    if (idx !== -1) quests.value[idx] = updated
    commitNames[quest.id] = ''
  } catch (e: any) {
    alert(e?.data?.message || 'Could not commit to quest.')
  } finally {
    commitingId.value = null
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Nunito:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.sos-wrapper { min-height: 100vh; background: #0a0b14; font-family: 'Nunito', sans-serif; color: #e8e4f0; position: relative; overflow-x: hidden; }
.bg-layer { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.18; animation: drift 14s ease-in-out infinite alternate; }
.orb-1 { width: 520px; height: 520px; background: #7c3aed; top: -120px; left: -100px; }
.orb-2 { width: 400px; height: 400px; background: #db2777; top: 40%; right: -80px; animation-delay: -5s; }
.orb-3 { width: 350px; height: 350px; background: #0ea5e9; bottom: -100px; left: 30%; animation-delay: -9s; }
@keyframes drift { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,20px) scale(1.08); } }
.grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(124,58,237,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,.06) 1px,transparent 1px); background-size: 40px 40px; }
.content { position: relative; z-index: 1; max-width: 660px; margin: 0 auto; padding: 32px 20px 60px; }
.site-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.logo-area { display: flex; align-items: center; gap: 12px; }
.logo-icon { font-size: 2rem; filter: drop-shadow(0 0 12px #7c3aed88); }
.logo-title { font-family: 'Cinzel', serif; font-size: 1.3rem; font-weight: 900; background: linear-gradient(135deg,#c4b5fd,#f0abfc,#93c5fd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.1; }
.logo-sub { font-size: .68rem; color: #7c6fa0; letter-spacing: .12em; text-transform: uppercase; }
.header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.status-badge { display: flex; align-items: center; gap: 7px; background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.3); border-radius: 20px; padding: 5px 14px; font-size: .75rem; font-weight: 600; color: #34d399; white-space: nowrap; }
.pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: #34d399; animation: pulse-green 2s ease-in-out infinite; flex-shrink: 0; }
@keyframes pulse-green { 0%,100% { box-shadow: 0 0 0 0 rgba(52,211,153,.5); } 50% { box-shadow: 0 0 0 5px rgba(52,211,153,0); } }
.tab-switcher { display: flex; gap: 4px; background: rgba(255,255,255,.04); border: 1px solid rgba(196,181,253,.12); border-radius: 10px; padding: 4px; }
.tab-btn { background: transparent; border: none; border-radius: 7px; padding: 7px 14px; font-family: 'Nunito', sans-serif; font-size: .8rem; font-weight: 700; color: #6b5fa0; cursor: pointer; transition: all .2s; position: relative; white-space: nowrap; }
.tab-btn.active { background: linear-gradient(135deg,rgba(124,58,237,.35),rgba(168,85,247,.2)); color: #c4b5fd; }
.board-count { position: absolute; top: -4px; right: -4px; background: #dc2626; color: #fff; font-size: .6rem; font-weight: 800; border-radius: 10px; padding: 1px 5px; line-height: 1.2; }
.sos-card, .board-panel { background: rgba(255,255,255,.03); border: 1px solid rgba(196,181,253,.12); border-radius: 20px; padding: 32px; backdrop-filter: blur(16px); box-shadow: 0 32px 80px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06); }
@media (max-width: 520px) { .sos-card, .board-panel { padding: 20px 16px; } }
.card-header { margin-bottom: 28px; }
.sos-tag { display: inline-block; background: linear-gradient(135deg,rgba(220,38,38,.25),rgba(251,113,133,.15)); border: 1px solid rgba(252,165,165,.3); color: #fca5a5; font-size: .68rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 10px; }
.sos-tag.board-tag { background: linear-gradient(135deg,rgba(234,179,8,.2),rgba(251,191,36,.1)); border-color: rgba(251,191,36,.3); color: #fbbf24; }
.sos-tag.mini { font-size: .62rem; padding: 2px 9px; margin: 0; }
.sos-tag.low    { background: rgba(16,185,129,.15); border-color: rgba(16,185,129,.3); color: #34d399; }
.sos-tag.medium { background: rgba(234,179,8,.12); border-color: rgba(234,179,8,.3); color: #facc15; }
.sos-tag.high   { background: rgba(220,38,38,.2); border-color: rgba(252,165,165,.3); color: #fca5a5; }
.card-title { font-family: 'Cinzel', serif; font-size: 1.8rem; font-weight: 900; background: linear-gradient(135deg,#e2d9f3,#c4b5fd 50%,#f0abfc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0 0 8px; }
.card-desc { color: #8b80a8; font-size: .9rem; line-height: 1.6; }
.card-desc strong { color: #c4b5fd; }
.sos-form { display: flex; flex-direction: column; gap: 20px; }
.field-group { display: flex; flex-direction: column; gap: 7px; }
.field-label { display: flex; align-items: center; gap: 6px; font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #a89bc4; transition: color .2s; }
.field-group.focused .field-label { color: #c4b5fd; }
.label-icon { font-size: .95rem; }
.input-wrap { position: relative; }
.field-input { width: 100%; background: rgba(255,255,255,.04); border: 1px solid rgba(196,181,253,.15); border-radius: 10px; padding: 11px 16px; color: #e8e4f0; font-family: 'Nunito', sans-serif; font-size: .93rem; transition: border-color .2s, background .2s, box-shadow .2s; outline: none; -webkit-appearance: none; }
.field-input::placeholder { color: #4b4569; }
.field-input:focus { border-color: rgba(196,181,253,.5); background: rgba(196,181,253,.06); box-shadow: 0 0 0 3px rgba(124,58,237,.15); }
.field-textarea { resize: vertical; min-height: 80px; max-height: 200px; line-height: 1.5; }
.select-wrap .field-input { padding-right: 36px; cursor: pointer; }
.select-wrap select option { background: #1a1628; color: #e8e4f0; }
.select-wrap select optgroup { color: #a89bc4; }
.select-arrow { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); color: #7c6fa0; font-size: .6rem; pointer-events: none; }
.check-mark { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); color: #34d399; font-weight: 700; }
.field-hint { display: block; font-size: .72rem; color: #5c5278; margin-top: 5px; font-style: italic; }
.char-count { position: absolute; bottom: 8px; right: 12px; font-size: .68rem; color: #5c5278; }
.boss-toggle-row { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,.03); border: 1px solid rgba(196,181,253,.12); border-radius: 12px; padding: 14px 16px; cursor: pointer; transition: all .2s; user-select: none; gap: 12px; }
.boss-toggle-row:hover { border-color: rgba(196,181,253,.3); }
.boss-toggle-row.active { border-color: rgba(248,113,113,.4); background: rgba(220,38,38,.08); }
.boss-toggle-left { display: flex; align-items: center; gap: 12px; }
.boss-icon { font-size: 1.4rem; }
.boss-toggle-title { font-size: .88rem; font-weight: 700; color: #e8e4f0; }
.boss-toggle-sub { font-size: .72rem; color: #6b5fa0; margin-top: 1px; }
.toggle-track { width: 42px; height: 24px; border-radius: 12px; background: rgba(255,255,255,.08); border: 1px solid rgba(196,181,253,.15); position: relative; transition: all .25s; flex-shrink: 0; }
.toggle-track.on { background: rgba(220,38,38,.55); border-color: rgba(248,113,113,.5); }
.toggle-thumb { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #a89bc4; transition: all .25s; }
.toggle-track.on .toggle-thumb { transform: translateX(18px); background: #fff; }
.boss-badge { display: inline-block; background: rgba(220,38,38,.2); border: 1px solid rgba(248,113,113,.35); color: #fca5a5; font-size: .68rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; letter-spacing: .06em; }
.boss-badge.small { font-size: .62rem; padding: 2px 8px; }
.urgency-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.urgency-pills { display: flex; gap: 8px; flex-wrap: wrap; }
.urgency-pill { background: rgba(255,255,255,.04); border: 1px solid rgba(196,181,253,.15); border-radius: 20px; padding: 6px 16px; font-family: 'Nunito', sans-serif; font-size: .78rem; font-weight: 700; color: #7c6fa0; cursor: pointer; transition: all .2s; }
.urgency-pill:hover { border-color: rgba(196,181,253,.4); color: #c4b5fd; }
.urgency-low.active    { background: rgba(16,185,129,.15); border-color: rgba(16,185,129,.4); color: #34d399; }
.urgency-medium.active { background: rgba(234,179,8,.12); border-color: rgba(234,179,8,.4); color: #facc15; }
.urgency-high.active   { background: rgba(220,38,38,.18); border-color: rgba(252,165,165,.4); color: #fca5a5; animation: urgency-pulse 1.5s ease-in-out infinite; }
@keyframes urgency-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); } 50% { box-shadow: 0 0 12px 2px rgba(220,38,38,.3); } }
.api-error { color: #fca5a5; font-size: .82rem; background: rgba(220,38,38,.1); border: 1px solid rgba(252,165,165,.2); border-radius: 8px; padding: 8px 14px; }
.submit-btn { margin-top: 6px; width: 100%; background: linear-gradient(135deg,#7c3aed,#a855f7,#db2777); border: none; border-radius: 12px; padding: 14px 24px; font-family: 'Cinzel', serif; font-size: 1rem; font-weight: 700; color: #fff; cursor: pointer; transition: all .25s; letter-spacing: .04em; box-shadow: 0 8px 28px rgba(124,58,237,.35); }
.submit-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(124,58,237,.45); }
.submit-btn.loading { background: linear-gradient(135deg,#4c1d95,#6d28d9); cursor: not-allowed; }
.btn-content { display: flex; align-items: center; justify-content: center; gap: 10px; }
.btn-icon { font-size: 1.1rem; }
.spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; flex-shrink: 0; }
.spinner.small { width: 13px; height: 13px; }
@keyframes spin { to { transform: rotate(360deg); } }
.active-quest-panel { background: rgba(196,181,253,.05); border: 1px solid rgba(196,181,253,.2); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 10px; }
.aq-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ticket-chip { background: rgba(196,181,253,.1); border: 1px solid rgba(196,181,253,.2); border-radius: 8px; padding: 2px 10px; font-size: .72rem; font-family: 'Cinzel', serif; color: #c4b5fd; letter-spacing: .08em; }
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
.filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
.filter-pill { background: rgba(255,255,255,.04); border: 1px solid rgba(196,181,253,.12); border-radius: 20px; padding: 6px 16px; font-family: 'Nunito', sans-serif; font-size: .78rem; font-weight: 700; color: #6b5fa0; cursor: pointer; transition: all .2s; }
.filter-pill:hover { border-color: rgba(196,181,253,.3); color: #c4b5fd; }
.filter-pill.active { background: rgba(124,58,237,.2); border-color: rgba(196,181,253,.4); color: #c4b5fd; }
.empty-board { text-align: center; padding: 48px 20px; color: #5c5278; }
.empty-icon { font-size: 3rem; margin-bottom: 12px; }
.empty-board p { font-size: .9rem; line-height: 1.7; }
.quest-list { display: flex; flex-direction: column; gap: 14px; }
.quest-card { background: rgba(255,255,255,.03); border: 1px solid rgba(196,181,253,.1); border-left-width: 3px; border-radius: 14px; padding: 18px 20px; transition: all .2s; }
.quest-card:hover { background: rgba(255,255,255,.05); }
.quest-card.resolved { opacity: .6; }
.urgency-border-low { border-left-color: #34d399; }
.urgency-border-medium { border-left-color: #facc15; }
.urgency-border-high { border-left-color: #f87171; }
.qc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.qc-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.urgency-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-low { background: #34d399; }
.dot-medium { background: #facc15; }
.dot-high { background: #f87171; animation: urgency-pulse 1.5s ease-in-out infinite; }
.qc-urgency { font-size: .72rem; font-weight: 700; color: #7c6fa0; text-transform: uppercase; letter-spacing: .06em; }
.qc-ticket { font-size: .7rem; color: #4b4569; font-family: 'Cinzel', serif; }
.qc-body { margin-bottom: 10px; }
.qc-player { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.qc-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg,#7c3aed,#db2777); display: flex; align-items: center; justify-content: center; font-family: 'Cinzel', serif; font-weight: 900; font-size: .9rem; color: #fff; flex-shrink: 0; }
.qc-name { font-weight: 700; font-size: .95rem; color: #e2d9f3; }
.qc-loc { font-size: .78rem; color: #6b5fa0; margin-top: 2px; }
.qc-issue { font-size: .84rem; color: #8b80a8; font-style: italic; border-left: 2px solid rgba(196,181,253,.2); padding-left: 10px; margin-top: 4px; }
.qc-heroes { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px 0; border-top: 1px solid rgba(196,181,253,.08); margin-top: 8px; }
.qc-heroes-label { font-size: .72rem; color: #6b5fa0; font-weight: 700; }
.qc-helpers { font-size: .8rem; color: #6b5fa0; padding-top: 8px; border-top: 1px solid rgba(196,181,253,.08); margin-top: 6px; }
.qc-helpers strong { color: #c4b5fd; }
.qc-footer { display: flex; padding-top: 12px; border-top: 1px solid rgba(196,181,253,.08); margin-top: 8px; }
.commit-area { display: flex; gap: 8px; width: 100%; align-items: center; }
.commit-input { flex: 1; padding: 9px 14px; font-size: .84rem; }
.commit-btn { background: linear-gradient(135deg,#7c3aed,#a855f7); border: none; border-radius: 10px; padding: 9px 18px; font-family: 'Nunito', sans-serif; font-size: .82rem; font-weight: 700; color: #fff; cursor: pointer; transition: all .2s; white-space: nowrap; }
.commit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(124,58,237,.35); }
.committing-msg { display: flex; align-items: center; gap: 8px; font-size: .82rem; color: #7c6fa0; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.75); backdrop-filter: blur(8px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal { background: #13111f; border: 1px solid rgba(196,181,253,.2); border-radius: 20px; padding: 32px; max-width: 420px; width: 100%; box-shadow: 0 32px 80px rgba(0,0,0,.6); text-align: center; }
.modal-icon { font-size: 2.5rem; margin-bottom: 10px; animation: pop .35s ease; }
@keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }
.modal-title { font-family: 'Cinzel', serif; font-size: 1.4rem; color: #e2d9f3; margin-bottom: 8px; }
.modal-desc { color: #8b80a8; font-size: .88rem; line-height: 1.6; margin-bottom: 20px; }
.helper-input-row { display: flex; gap: 8px; margin-bottom: 12px; }
.add-helper-btn { background: linear-gradient(135deg,#7c3aed,#a855f7); border: none; border-radius: 10px; width: 42px; flex-shrink: 0; font-size: 1.2rem; color: #fff; cursor: pointer; transition: all .2s; }
.helper-chips { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-bottom: 16px; min-height: 28px; }
.modal-actions { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }
.modal-cancel { background: transparent; border: 1px solid rgba(196,181,253,.25); border-radius: 10px; padding: 10px 22px; color: #7c6fa0; font-family: 'Nunito', sans-serif; font-size: .88rem; font-weight: 700; cursor: pointer; transition: all .2s; }
.modal-confirm { background: linear-gradient(135deg,rgba(16,185,129,.3),rgba(5,150,105,.2)); border: 1px solid rgba(16,185,129,.4); border-radius: 10px; padding: 10px 22px; color: #34d399; font-family: 'Nunito', sans-serif; font-size: .88rem; font-weight: 700; cursor: pointer; transition: all .2s; }
.modal-confirm:hover { background: linear-gradient(135deg,rgba(16,185,129,.4),rgba(5,150,105,.3)); transform: translateY(-1px); }
.site-footer { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 36px; font-size: .72rem; color: #3d3556; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; flex-wrap: wrap; }
.dot { color: #5c5278; }
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
