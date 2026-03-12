<template>
  <div>
      <div class="gf-hero">
        <div class="gf-title-tag">⚔️ GUILD FINDER</div>
        <h2 class="gf-title">Find Your Guild</h2>
        <p class="gf-desc">Join a guild, conquer dungeons together, and forge lasting alliances.</p>
      </div>

      <!-- Filters -->
      <div class="filter-panel">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            v-model="filters.search"
            type="text"
            class="search-input"
            placeholder="Search guild name, tag..."
            @input="debouncedLoad"
          />
        </div>
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Playstyle</label>
            <div class="input-wrap select-wrap">
              <select v-model="filters.playstyle" class="filter-select" @change="loadGuilds">
                <option value="">All Playstyles</option>
                <option value="casual">🌿 Casual</option>
                <option value="hardcore">💀 Hardcore</option>
                <option value="pvp">⚔️ PvP</option>
                <option value="pve">🐉 PvE</option>
                <option value="social">🎉 Social</option>
              </select>
              <span class="chevron">▾</span>
            </div>
          </div>
          <div class="filter-group">
            <label class="filter-label">Server</label>
            <div class="input-wrap select-wrap">
              <select v-model="filters.server" class="filter-select" @change="loadGuilds">
                <option value="">Any Server</option>
                <option>Twilly</option>
                <option>Artix</option>
                <option>Gravelyn</option>
                <option>Sir Ver</option>
                <option>Alteon</option>
                <option>Yokai (SEA)</option>
                <option>Twig</option>
                <option>Sepulchure</option>
                <option>Safiria</option>
                <option>Swordhaven (EU)</option>
                <option>Yorumi</option>
              </select>
              <span class="chevron">▾</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Guild Grid -->
      <div v-if="loading" class="gf-loading">
        <span class="spinner"></span> Searching guilds...
      </div>
      <div v-else-if="!guilds.length" class="gf-empty">
        <div class="empty-icon">🏰</div>
        <h3>No guilds found</h3>
        <p>Be the first to create one! Guild creation coming soon.</p>
      </div>
      <div v-else class="guild-grid">
        <div v-for="guild in guilds" :key="guild.id" class="guild-card">
          <div class="guild-card-top">
            <div class="guild-tag-badge">[{{ guild.tag }}]</div>
            <div class="guild-recruiting" v-if="guild.isRecruiting">
              <span class="pulse-dot"></span> Recruiting
            </div>
          </div>
          <h3 class="guild-name">{{ guild.name }}</h3>
          <p class="guild-desc" v-if="guild.description">{{ guild.description }}</p>
          <p class="guild-desc placeholder" v-else>No description provided.</p>

          <div class="guild-meta">
            <div class="meta-row">
              <span class="meta-item">
                {{ playstyleIcon(guild.playstyle) }} <strong>{{ capitalize(guild.playstyle) }}</strong>
              </span>
              <span class="meta-item">🌐 {{ guild.server }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-item">👥 {{ guild.memberCount }} members</span>
              <span class="meta-item" v-if="guild.minLevel > 1">⚡ Lv.{{ guild.minLevel }}+</span>
            </div>
          </div>

          <div class="guild-footer">
            <div class="guild-leader">
              <div class="leader-avatar">{{ guild.leader[0].toUpperCase() }}</div>
              <div>
                <div class="leader-label">Guild Master</div>
                <div class="leader-name">{{ guild.leader }}</div>
              </div>
            </div>
            <button class="apply-btn" @click="openApply(guild)">Apply ⚔️</button>
          </div>
        </div>
      </div>

      <!-- Create Guild CTA -->
      <div class="create-guild-cta">
        <div class="cta-icon">🏰</div>
        <div class="cta-text">
          <h3>Want to create your own guild?</h3>
          <p>Guild creation is coming soon! Stay tuned for updates.</p>
        </div>
        <button class="cta-btn" disabled>Coming Soon</button>
      </div>

      <footer class="site-footer">
        <span>Side Quest World</span>
        <span class="dot">·</span>
        <span>Guild Finder</span>
        <span class="dot">·</span>
        <span>Heroes Never Quit</span>
      </footer>

    <!-- Apply Modal -->
    <Transition name="modal-fade">
      <div v-if="applyGuild" class="modal-backdrop" @click.self="applyGuild = null">
        <div class="modal">
          <div class="modal-icon">⚔️</div>
          <h3 class="modal-title">Apply to <span class="modal-guild">[{{ applyGuild.tag }}] {{ applyGuild.name }}</span></h3>
          <p class="modal-desc">Send a request to join this guild. The Guild Master will review your application.</p>
          <div class="field-group">
            <label class="field-label">Your Message (optional)</label>
            <textarea v-model="applyMessage" class="field-input field-textarea" placeholder="Tell them why you want to join..." rows="3"></textarea>
          </div>
          <p class="modal-coming-soon">🚧 Applications are not yet connected — this feature is coming soon!</p>
          <div class="modal-actions">
            <button class="modal-cancel" @click="applyGuild = null">Cancel</button>
            <button class="modal-confirm" @click="applyGuild = null">Send Application</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({ title: 'Guild Finder — Side Quest World' })

interface Guild {
  id: string
  name: string
  tag: string
  description: string | null
  leader: string
  leaderIngame: string
  minLevel: number
  playstyle: string
  server: string
  memberCount: number
  isRecruiting: boolean
}

const filters = reactive({ search: '', playstyle: '', server: '' })
const guilds = ref<Guild[]>([])
const loading = ref(false)
const applyGuild = ref<Guild | null>(null)
const applyMessage = ref('')

// Debounce search
let searchTimer: any
function debouncedLoad() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadGuilds, 350)
}

async function loadGuilds() {
  loading.value = true
  try {
    const params: any = {}
    if (filters.search) params.search = filters.search
    if (filters.playstyle) params.playstyle = filters.playstyle
    if (filters.server) params.server = filters.server
    guilds.value = await $fetch<Guild[]>('/api/guilds', { params })
  } catch {
    guilds.value = []
  } finally {
    loading.value = false
  }
}

function openApply(guild: Guild) {
  applyGuild.value = guild
  applyMessage.value = ''
}

function playstyleIcon(p: string) {
  const map: Record<string, string> = {
    casual: '🌿', hardcore: '💀', pvp: '⚔️', pve: '🐉', social: '🎉'
  }
  return map[p] ?? '🎯'
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

onMounted(loadGuilds)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Nunito:wght@400;600;700;800&display=swap');
* { box-sizing: border-box; }

.gf-wrapper { min-height: 100vh; background: #0d0b1a; font-family: 'Nunito', sans-serif; position: relative; }
.bg-layer { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .35; }
.orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, #7c3aed, transparent 70%); top: -10%; left: -10%; animation: drift1 18s ease-in-out infinite; }
.orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, #0891b2, transparent 70%); bottom: -5%; right: -5%; animation: drift2 22s ease-in-out infinite; }
.orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, #065f46, transparent 70%); top: 40%; right: 10%; animation: drift3 15s ease-in-out infinite; }
.grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(196,181,253,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(196,181,253,.03) 1px, transparent 1px); background-size: 40px 40px; }
@keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,20px) scale(1.05)} }
@keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,-30px) scale(1.08)} }
@keyframes drift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(15px,-15px) scale(0.95)} }

.content { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; padding: 0 20px 60px; }

.site-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 0 20px; gap: 16px; }
.logo-area { display: flex; align-items: center; gap: 12px; }
.logo-icon { font-size: 1.8rem; }
.logo-title { font-family: 'Cinzel', serif; font-size: 1.3rem; font-weight: 900; background: linear-gradient(135deg, #e2d9f3, #c4b5fd 50%, #f0abfc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
.logo-sub { color: #7c6fa0; font-size: .78rem; margin: 0; }
.back-btn { background: rgba(255,255,255,.05); border: 1px solid rgba(196,181,253,.2); border-radius: 8px; padding: 8px 16px; color: #c4b5fd; text-decoration: none; font-size: .82rem; font-weight: 700; transition: all .2s; }
.back-btn:hover { background: rgba(196,181,253,.1); }

.gf-hero { text-align: center; margin-bottom: 28px; }
.gf-title-tag { display: inline-block; background: linear-gradient(135deg, rgba(6,182,212,.2), rgba(8,145,178,.1)); border: 1px solid rgba(6,182,212,.3); color: #67e8f9; font-size: .68rem; font-weight: 700; letter-spacing: .15em; padding: 4px 14px; border-radius: 20px; margin-bottom: 10px; }
.gf-title { font-family: 'Cinzel', serif; font-size: 2rem; font-weight: 900; background: linear-gradient(135deg, #a5f3fc, #06b6d4 50%, #0891b2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px; }
.gf-desc { color: #8b80a8; font-size: .9rem; margin: 0; }

.filter-panel { background: rgba(255,255,255,.03); border: 1px solid rgba(196,181,253,.1); border-radius: 16px; padding: 20px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 14px; }
.search-wrap { position: relative; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 1rem; }
.search-input { width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(196,181,253,.15); border-radius: 10px; padding: 11px 16px 11px 42px; font-family: 'Nunito', sans-serif; font-size: .9rem; color: #e8e4f0; outline: none; transition: all .2s; }
.search-input:focus { border-color: rgba(196,181,253,.4); background: rgba(255,255,255,.07); box-shadow: 0 0 0 3px rgba(124,58,237,.12); }
.filter-row { display: flex; gap: 14px; flex-wrap: wrap; }
.filter-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 160px; }
.filter-label { font-size: .72rem; font-weight: 700; color: #5c5278; text-transform: uppercase; letter-spacing: .08em; }
.input-wrap { position: relative; }
.select-wrap .chevron { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #7c6fa0; pointer-events: none; font-size: .9rem; }
.filter-select { width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(196,181,253,.15); border-radius: 10px; padding: 10px 36px 10px 14px; font-family: 'Nunito', sans-serif; font-size: .88rem; color: #e8e4f0; outline: none; appearance: none; cursor: pointer; transition: all .2s; }
.filter-select:focus { border-color: rgba(196,181,253,.4); background: rgba(255,255,255,.07); box-shadow: 0 0 0 3px rgba(124,58,237,.12); }
.filter-select option { background: #1a1530; color: #e8e4f0; }

.gf-loading, .gf-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: #5c5278; }
.gf-empty h3 { font-family: 'Cinzel', serif; color: #7c6fa0; margin: 0; }
.gf-empty p { font-size: .88rem; margin: 0; }
.empty-icon { font-size: 3rem; }
.spinner { width: 24px; height: 24px; border: 2px solid rgba(196,181,253,.2); border-top-color: #c4b5fd; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.guild-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 28px; }

.guild-card { background: rgba(255,255,255,.03); border: 1px solid rgba(196,181,253,.12); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 10px; transition: all .2s; }
.guild-card:hover { border-color: rgba(196,181,253,.25); background: rgba(255,255,255,.05); transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,.3); }
.guild-card-top { display: flex; align-items: center; justify-content: space-between; }
.guild-tag-badge { background: rgba(124,58,237,.2); border: 1px solid rgba(196,181,253,.25); border-radius: 8px; padding: 3px 10px; font-family: 'Cinzel', serif; font-size: .78rem; color: #c4b5fd; font-weight: 700; }
.guild-recruiting { display: flex; align-items: center; gap: 6px; font-size: .72rem; color: #34d399; font-weight: 700; }
.pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; animation: pulse-green 2s ease-in-out infinite; }
@keyframes pulse-green { 0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,.5)} 50%{box-shadow:0 0 0 4px rgba(52,211,153,0)} }
.guild-name { font-family: 'Cinzel', serif; font-size: 1.1rem; font-weight: 700; color: #e2d9f3; margin: 0; }
.guild-desc { font-size: .82rem; color: #7c6fa0; margin: 0; line-height: 1.5; flex: 1; }
.guild-desc.placeholder { font-style: italic; color: #4b4569; }
.guild-meta { display: flex; flex-direction: column; gap: 6px; }
.meta-row { display: flex; gap: 14px; flex-wrap: wrap; }
.meta-item { font-size: .78rem; color: #8b80a8; }
.meta-item strong { color: #c4b5fd; }
.guild-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; padding-top: 12px; border-top: 1px solid rgba(196,181,253,.08); }
.guild-leader { display: flex; align-items: center; gap: 10px; }
.leader-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #4c1d95, #7c3aed); display: flex; align-items: center; justify-content: center; font-family: 'Cinzel', serif; font-size: .85rem; font-weight: 900; color: #c4b5fd; flex-shrink: 0; }
.leader-label { font-size: .62rem; color: #4b4569; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.leader-name { font-size: .8rem; color: #a89bc4; font-weight: 600; }
.apply-btn { background: linear-gradient(135deg, rgba(6,182,212,.2), rgba(8,145,178,.15)); border: 1px solid rgba(6,182,212,.4); border-radius: 8px; padding: 7px 16px; font-family: 'Nunito', sans-serif; font-size: .8rem; font-weight: 700; color: #67e8f9; cursor: pointer; transition: all .2s; white-space: nowrap; }
.apply-btn:hover { background: linear-gradient(135deg, rgba(6,182,212,.35), rgba(8,145,178,.25)); transform: translateY(-1px); }

.create-guild-cta { background: rgba(255,255,255,.02); border: 1px dashed rgba(196,181,253,.15); border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
.cta-icon { font-size: 2rem; flex-shrink: 0; }
.cta-text { flex: 1; }
.cta-text h3 { font-family: 'Cinzel', serif; font-size: .95rem; color: #7c6fa0; margin: 0 0 4px; }
.cta-text p { font-size: .8rem; color: #4b4569; margin: 0; }
.cta-btn { background: rgba(255,255,255,.04); border: 1px solid rgba(196,181,253,.12); border-radius: 8px; padding: 9px 18px; font-family: 'Nunito', sans-serif; font-size: .82rem; font-weight: 700; color: #4b4569; cursor: not-allowed; white-space: nowrap; }

/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.75); backdrop-filter: blur(6px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal { background: #13102a; border: 1px solid rgba(196,181,253,.2); border-radius: 20px; padding: 32px; max-width: 440px; width: 100%; box-shadow: 0 40px 100px rgba(0,0,0,.6); display: flex; flex-direction: column; gap: 14px; }
.modal-icon { font-size: 2rem; text-align: center; }
.modal-title { font-family: 'Cinzel', serif; font-size: 1.1rem; color: #e2d9f3; margin: 0; text-align: center; }
.modal-guild { color: #c4b5fd; }
.modal-desc { font-size: .85rem; color: #7c6fa0; margin: 0; text-align: center; line-height: 1.6; }
.field-group { display: flex; flex-direction: column; gap: 7px; }
.field-label { font-size: .72rem; font-weight: 700; color: #5c5278; text-transform: uppercase; letter-spacing: .08em; }
.field-input { width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(196,181,253,.15); border-radius: 10px; padding: 11px 16px; font-family: 'Nunito', sans-serif; font-size: .9rem; color: #e8e4f0; outline: none; transition: all .2s; }
.field-input:focus { border-color: rgba(196,181,253,.4); background: rgba(255,255,255,.07); }
.field-textarea { resize: vertical; }
.modal-coming-soon { font-size: .75rem; color: #f59e0b; background: rgba(234,179,8,.08); border: 1px solid rgba(234,179,8,.2); border-radius: 8px; padding: 8px 12px; text-align: center; margin: 0; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.modal-cancel { background: transparent; border: 1px solid rgba(196,181,253,.2); border-radius: 8px; padding: 9px 18px; font-family: 'Nunito', sans-serif; font-size: .85rem; font-weight: 700; color: #7c6fa0; cursor: pointer; transition: all .2s; }
.modal-cancel:hover { border-color: rgba(196,181,253,.4); color: #c4b5fd; }
.modal-confirm { background: linear-gradient(135deg, rgba(6,182,212,.3), rgba(8,145,178,.2)); border: 1px solid rgba(6,182,212,.4); border-radius: 8px; padding: 9px 20px; font-family: 'Nunito', sans-serif; font-size: .85rem; font-weight: 700; color: #67e8f9; cursor: pointer; transition: all .2s; }
.modal-confirm:hover { background: linear-gradient(135deg, rgba(6,182,212,.45), rgba(8,145,178,.35)); }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.site-footer { text-align: center; padding: 32px 0 0; font-size: .78rem; color: #3d3555; display: flex; gap: 8px; justify-content: center; align-items: center; flex-wrap: wrap; }
.dot { opacity: .4; }
</style>