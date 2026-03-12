<template>
  <div>
      <div class="eq-hero">
        <div class="eq-title-tag">🗡️ EQUIPMENT RATER</div>
        <h2 class="eq-title">Equipment Preview & Rating</h2>
        <p class="eq-desc">Share your gear setups, get rated by the community, and discover top builds.</p>
      </div>

      <!-- Categories Filter -->
      <div class="cat-tabs">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="cat-tab"
          :class="{ active: activeCategory === cat.value }"
          @click="activeCategory = cat.value"
        >
          {{ cat.icon }} {{ cat.label }}
        </button>
      </div>

      <!-- Mock Equipment Cards -->
      <div class="eq-grid">
        <div v-for="item in mockItems" :key="item.id" class="eq-card" :class="item.rarity">
          <div class="eq-card-top">
            <div class="rarity-gem" :class="item.rarity"></div>
            <span class="rarity-label" :class="item.rarity">{{ capitalize(item.rarity) }}</span>
            <span class="eq-class">{{ item.class }}</span>
          </div>

          <div class="eq-icon-wrap" :class="item.rarity">
            <span class="eq-icon">{{ item.icon }}</span>
          </div>

          <h3 class="eq-name">{{ item.name }}</h3>
          <p class="eq-stats-label">Stats</p>
          <div class="eq-stats">
            <div v-for="stat in item.stats" :key="stat.name" class="stat-row">
              <span class="stat-name">{{ stat.name }}</span>
              <div class="stat-bar-wrap">
                <div class="stat-bar" :style="{ width: stat.val + '%' }" :class="item.rarity"></div>
              </div>
              <span class="stat-val">{{ stat.val }}</span>
            </div>
          </div>

          <!-- Rating -->
          <div class="eq-rating">
            <div class="stars-row">
              <button
                v-for="star in 5"
                :key="star"
                class="star-btn"
                :class="{ filled: star <= (userRatings[item.id] || item.communityRating) }"
                @click="rateItem(item.id, star)"
              >★</button>
            </div>
            <span class="rating-text">
              {{ item.communityRating.toFixed(1) }} / 5
              <span class="rating-count">({{ item.rateCount }} ratings)</span>
            </span>
          </div>

          <div class="eq-actions">
            <button class="eq-btn preview" @click="previewItem = item">🔍 Preview</button>
            <button class="eq-btn rate" @click="openRateModal(item)">⭐ Rate</button>
          </div>
        </div>
      </div>

      <!-- Submit Build CTA -->
      <div class="submit-cta">
        <div class="cta-content">
          <span class="cta-icon">🛡️</span>
          <div>
            <h3>Share Your Build</h3>
            <p>Submit your equipment setup and get rated by the community.</p>
          </div>
        </div>
        <button class="cta-btn" disabled>Submit Build (Soon)</button>
      </div>

      <footer class="site-footer">
        <span>Side Quest World</span>
        <span class="dot">·</span>
        <span>Equipment Preview</span>
        <span class="dot">·</span>
        <span>Heroes Never Quit</span>
      </footer>

    <!-- Preview Modal -->
    <Transition name="modal-fade">
      <div v-if="previewItem" class="modal-backdrop" @click.self="previewItem = null">
        <div class="modal preview-modal" :class="previewItem.rarity">
          <div class="pm-header">
            <div class="pm-icon-wrap" :class="previewItem.rarity">
              <span class="pm-icon">{{ previewItem.icon }}</span>
            </div>
            <div>
              <div class="pm-rarity" :class="previewItem.rarity">{{ capitalize(previewItem.rarity) }}</div>
              <h3 class="pm-name">{{ previewItem.name }}</h3>
              <p class="pm-class">{{ previewItem.class }}</p>
            </div>
          </div>
          <p class="pm-lore">"{{ previewItem.lore }}"</p>
          <div class="pm-stats">
            <div v-for="stat in previewItem.stats" :key="stat.name" class="stat-row large">
              <span class="stat-name">{{ stat.name }}</span>
              <div class="stat-bar-wrap">
                <div class="stat-bar" :style="{ width: stat.val + '%' }" :class="previewItem.rarity"></div>
              </div>
              <span class="stat-val">{{ stat.val }}</span>
            </div>
          </div>
          <div class="pm-community">
            <span class="pm-rating-label">Community Rating</span>
            <div class="stars-row large">
              <span v-for="s in 5" :key="s" class="star" :class="{ filled: s <= previewItem.communityRating }">★</span>
            </div>
            <span class="pm-rating-val">{{ previewItem.communityRating.toFixed(1) }} / 5 ({{ previewItem.rateCount }} ratings)</span>
          </div>
          <button class="modal-close-btn" @click="previewItem = null">Close</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({ title: 'Equipment Preview — Side Quest World' })

interface Stat { name: string; val: number }
interface EqItem {
  id: number; name: string; icon: string; rarity: string; class: string
  stats: Stat[]; communityRating: number; rateCount: number; lore: string
}

const categories = [
  { value: 'all', label: 'All', icon: '🗂️' },
  { value: 'weapon', label: 'Weapons', icon: '⚔️' },
  { value: 'armor', label: 'Armor', icon: '🛡️' },
  { value: 'helm', label: 'Helms', icon: '🪖' },
  { value: 'cape', label: 'Capes', icon: '🧥' },
  { value: 'pet', label: 'Pets', icon: '🐉' },
]

const activeCategory = ref('all')
const userRatings = reactive<Record<number, number>>({})
const previewItem = ref<EqItem | null>(null)

const mockItems: EqItem[] = [
  {
    id: 1, name: 'Voidwraith Blade', icon: '🗡️', rarity: 'legendary', class: '⚔️ Weapon',
    lore: 'Forged in the void between realms, this blade hungers for the souls of the fallen.',
    stats: [
      { name: 'STR', val: 92 }, { name: 'INT', val: 45 }, { name: 'DEX', val: 78 }, { name: 'LUK', val: 60 }
    ],
    communityRating: 4.8, rateCount: 342,
  },
  {
    id: 2, name: 'Crystalweave Robe', icon: '👘', rarity: 'epic', class: '🛡️ Armor',
    lore: 'Woven from crystallized mana, this robe bends light and confuses enemies.',
    stats: [
      { name: 'INT', val: 88 }, { name: 'END', val: 55 }, { name: 'WIS', val: 72 }, { name: 'LUK', val: 50 }
    ],
    communityRating: 4.3, rateCount: 218,
  },
  {
    id: 3, name: 'Shadowveil Cape', icon: '🧥', rarity: 'rare', class: '🧥 Cape',
    lore: 'A cape that casts no shadow. Those who wear it become one with the dark.',
    stats: [
      { name: 'DEX', val: 80 }, { name: 'LUK', val: 65 }, { name: 'STR', val: 40 }, { name: 'END', val: 55 }
    ],
    communityRating: 3.9, rateCount: 145,
  },
  {
    id: 4, name: 'Ember Gauntlets', icon: '🥊', rarity: 'epic', class: '🛡️ Armor',
    lore: 'Tempered in dragonfire, these gauntlets burn with unquenchable fury.',
    stats: [
      { name: 'STR', val: 85 }, { name: 'END', val: 70 }, { name: 'INT', val: 30 }, { name: 'DEX', val: 50 }
    ],
    communityRating: 4.1, rateCount: 189,
  },
  {
    id: 5, name: 'Sproutling Companion', icon: '🌱', rarity: 'uncommon', class: '🐉 Pet',
    lore: 'An ancient forest spirit trapped in adorable leaf form. Don\'t underestimate it.',
    stats: [
      { name: 'LUK', val: 75 }, { name: 'WIS', val: 60 }, { name: 'INT', val: 55 }, { name: 'DEX', val: 45 }
    ],
    communityRating: 4.6, rateCount: 97,
  },
  {
    id: 6, name: 'Iron Sentinel Helm', icon: '🪖', rarity: 'rare', class: '🪖 Helm',
    lore: 'Carved from the first iron ever smelted. Heavy, but unyielding as conviction.',
    stats: [
      { name: 'END', val: 90 }, { name: 'STR', val: 60 }, { name: 'DEX', val: 35 }, { name: 'LUK', val: 25 }
    ],
    communityRating: 3.7, rateCount: 112,
  },
]

function rateItem(id: number, stars: number) {
  userRatings[id] = stars
}

function openRateModal(item: EqItem) {
  previewItem.value = item
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Nunito:wght@400;600;700;800&display=swap');
* { box-sizing: border-box; }

.eq-wrapper { min-height: 100vh; background: #0d0b1a; font-family: 'Nunito', sans-serif; position: relative; }
.bg-layer { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .35; }
.orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, #7c3aed, transparent 70%); top: -10%; left: -10%; animation: drift1 18s ease-in-out infinite; }
.orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, #d97706, transparent 70%); bottom: -5%; right: -5%; animation: drift2 22s ease-in-out infinite; }
.orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, #dc2626, transparent 70%); top: 30%; right: 15%; animation: drift3 15s ease-in-out infinite; }
.grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(196,181,253,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(196,181,253,.03) 1px, transparent 1px); background-size: 40px 40px; }
@keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,20px) scale(1.05)} }
@keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,-30px) scale(1.08)} }
@keyframes drift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(15px,-15px) scale(0.95)} }

.content { position: relative; z-index: 1; max-width: 960px; margin: 0 auto; padding: 0 20px 60px; }

.site-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 0 20px; gap: 16px; }
.logo-area { display: flex; align-items: center; gap: 12px; }
.logo-icon { font-size: 1.8rem; }
.logo-title { font-family: 'Cinzel', serif; font-size: 1.3rem; font-weight: 900; background: linear-gradient(135deg, #e2d9f3, #c4b5fd 50%, #f0abfc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
.logo-sub { color: #7c6fa0; font-size: .78rem; margin: 0; }
.back-btn { background: rgba(255,255,255,.05); border: 1px solid rgba(196,181,253,.2); border-radius: 8px; padding: 8px 16px; color: #c4b5fd; text-decoration: none; font-size: .82rem; font-weight: 700; transition: all .2s; }
.back-btn:hover { background: rgba(196,181,253,.1); }

.coming-soon-banner { background: rgba(234,179,8,.06); border: 1px solid rgba(234,179,8,.2); border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.cs-badge { background: rgba(234,179,8,.2); border: 1px solid rgba(234,179,8,.35); border-radius: 20px; padding: 4px 12px; font-size: .7rem; font-weight: 800; color: #fbbf24; letter-spacing: .1em; white-space: nowrap; }
.coming-soon-banner p { font-size: .82rem; color: #9ca3af; margin: 0; line-height: 1.5; }

.eq-hero { text-align: center; margin-bottom: 28px; }
.eq-title-tag { display: inline-block; background: linear-gradient(135deg, rgba(217,119,6,.2), rgba(245,158,11,.1)); border: 1px solid rgba(245,158,11,.3); color: #fbbf24; font-size: .68rem; font-weight: 700; letter-spacing: .15em; padding: 4px 14px; border-radius: 20px; margin-bottom: 10px; }
.eq-title { font-family: 'Cinzel', serif; font-size: 2rem; font-weight: 900; background: linear-gradient(135deg, #fde68a, #f59e0b 50%, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px; }
.eq-desc { color: #8b80a8; font-size: .9rem; margin: 0; }

.cat-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
.cat-tab { background: rgba(255,255,255,.04); border: 1px solid rgba(196,181,253,.12); border-radius: 20px; padding: 7px 16px; font-family: 'Nunito', sans-serif; font-size: .8rem; font-weight: 700; color: #6b5fa0; cursor: pointer; transition: all .2s; }
.cat-tab:hover { border-color: rgba(196,181,253,.25); color: #c4b5fd; }
.cat-tab.active { background: rgba(124,58,237,.2); border-color: rgba(196,181,253,.4); color: #c4b5fd; }

/* Rarity colors */
.legendary { --rarity-color: #f59e0b; --rarity-bg: rgba(245,158,11,.15); --rarity-border: rgba(245,158,11,.35); }
.epic      { --rarity-color: #a855f7; --rarity-bg: rgba(168,85,247,.15); --rarity-border: rgba(168,85,247,.35); }
.rare      { --rarity-color: #3b82f6; --rarity-bg: rgba(59,130,246,.15); --rarity-border: rgba(59,130,246,.3); }
.uncommon  { --rarity-color: #22c55e; --rarity-bg: rgba(34,197,94,.12); --rarity-border: rgba(34,197,94,.3); }
.common    { --rarity-color: #9ca3af; --rarity-bg: rgba(156,163,175,.1); --rarity-border: rgba(156,163,175,.25); }

.eq-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-bottom: 28px; }

.eq-card { background: rgba(255,255,255,.03); border: 1px solid var(--rarity-border, rgba(196,181,253,.12)); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 10px; transition: all .2s; position: relative; overflow: hidden; }
.eq-card::before { content: ''; position: absolute; inset: 0; background: var(--rarity-bg, transparent); opacity: .3; pointer-events: none; }
.eq-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,.4); border-color: var(--rarity-color, rgba(196,181,253,.3)); }
.eq-card-top { display: flex; align-items: center; gap: 8px; }
.rarity-gem { width: 8px; height: 8px; border-radius: 50%; background: var(--rarity-color); box-shadow: 0 0 6px var(--rarity-color); flex-shrink: 0; }
.rarity-label { font-size: .7rem; font-weight: 800; color: var(--rarity-color); text-transform: uppercase; letter-spacing: .1em; }
.eq-class { margin-left: auto; font-size: .72rem; color: #5c5278; }

.eq-icon-wrap { width: 70px; height: 70px; border-radius: 14px; background: var(--rarity-bg); border: 2px solid var(--rarity-border); display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.eq-icon { font-size: 2.2rem; }

.eq-name { font-family: 'Cinzel', serif; font-size: 1rem; font-weight: 700; color: var(--rarity-color); margin: 0; text-align: center; }
.eq-stats-label { font-size: .68rem; font-weight: 700; color: #4b4569; text-transform: uppercase; letter-spacing: .1em; margin: 0; }

.stat-row { display: flex; align-items: center; gap: 8px; }
.stat-row.large { gap: 10px; }
.stat-name { font-size: .72rem; font-weight: 700; color: #7c6fa0; width: 32px; flex-shrink: 0; }
.stat-bar-wrap { flex: 1; height: 5px; background: rgba(255,255,255,.06); border-radius: 3px; overflow: hidden; }
.stat-bar { height: 100%; border-radius: 3px; background: var(--rarity-color); transition: width .4s ease; }
.stat-val { font-size: .72rem; color: #c4b5fd; font-weight: 700; width: 24px; text-align: right; flex-shrink: 0; }

.eq-rating { display: flex; align-items: center; gap: 10px; }
.stars-row { display: flex; gap: 2px; }
.stars-row.large { gap: 4px; }
.star-btn { background: none; border: none; cursor: pointer; font-size: 1.1rem; color: #3d3555; padding: 0; transition: all .15s; line-height: 1; }
.star-btn.filled { color: #f59e0b; text-shadow: 0 0 8px rgba(245,158,11,.4); }
.star-btn:hover { transform: scale(1.2); }
.star { font-size: 1.2rem; color: #3d3555; }
.star.filled { color: #f59e0b; text-shadow: 0 0 8px rgba(245,158,11,.4); }
.rating-text { font-size: .75rem; color: #7c6fa0; font-weight: 600; }
.rating-count { color: #4b4569; font-weight: 400; }

.eq-actions { display: flex; gap: 8px; }
.eq-btn { flex: 1; border-radius: 8px; padding: 8px; font-family: 'Nunito', sans-serif; font-size: .78rem; font-weight: 700; cursor: pointer; transition: all .2s; border: 1px solid; }
.eq-btn.preview { background: rgba(255,255,255,.04); border-color: rgba(196,181,253,.2); color: #8b80a8; }
.eq-btn.preview:hover { background: rgba(196,181,253,.08); color: #c4b5fd; }
.eq-btn.rate { background: var(--rarity-bg); border-color: var(--rarity-border); color: var(--rarity-color); }
.eq-btn.rate:hover { background: rgba(245,158,11,.2); }

.submit-cta { background: rgba(255,255,255,.02); border: 1px dashed rgba(196,181,253,.15); border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
.cta-content { display: flex; align-items: center; gap: 16px; flex: 1; }
.cta-icon { font-size: 2rem; }
.cta-content h3 { font-family: 'Cinzel', serif; font-size: .95rem; color: #7c6fa0; margin: 0 0 4px; }
.cta-content p { font-size: .8rem; color: #4b4569; margin: 0; }
.cta-btn { background: rgba(255,255,255,.04); border: 1px solid rgba(196,181,253,.12); border-radius: 8px; padding: 10px 20px; font-family: 'Nunito', sans-serif; font-size: .82rem; font-weight: 700; color: #4b4569; cursor: not-allowed; }

/* Preview Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.8); backdrop-filter: blur(8px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal { background: #13102a; border-radius: 24px; padding: 32px; max-width: 440px; width: 100%; box-shadow: 0 40px 100px rgba(0,0,0,.7); display: flex; flex-direction: column; gap: 16px; }
.preview-modal { border: 1px solid var(--rarity-border); }
.pm-header { display: flex; align-items: center; gap: 16px; }
.pm-icon-wrap { width: 64px; height: 64px; border-radius: 16px; background: var(--rarity-bg); border: 2px solid var(--rarity-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pm-icon { font-size: 2rem; }
.pm-rarity { font-size: .7rem; font-weight: 800; color: var(--rarity-color); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 4px; }
.pm-name { font-family: 'Cinzel', serif; font-size: 1.2rem; font-weight: 900; color: #e2d9f3; margin: 0 0 2px; }
.pm-class { font-size: .78rem; color: #5c5278; margin: 0; }
.pm-lore { font-size: .82rem; color: #7c6fa0; font-style: italic; border-left: 2px solid var(--rarity-border); padding-left: 12px; margin: 0; line-height: 1.6; }
.pm-stats { display: flex; flex-direction: column; gap: 8px; }
.pm-community { display: flex; flex-direction: column; gap: 6px; align-items: center; background: rgba(255,255,255,.03); border-radius: 12px; padding: 16px; }
.pm-rating-label { font-size: .72rem; font-weight: 700; color: #5c5278; text-transform: uppercase; letter-spacing: .08em; }
.pm-rating-val { font-size: .8rem; color: #7c6fa0; }
.modal-close-btn { background: rgba(255,255,255,.05); border: 1px solid rgba(196,181,253,.2); border-radius: 10px; padding: 11px; font-family: 'Nunito', sans-serif; font-size: .88rem; font-weight: 700; color: #7c6fa0; cursor: pointer; transition: all .2s; }
.modal-close-btn:hover { background: rgba(196,181,253,.1); color: #c4b5fd; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.site-footer { text-align: center; padding: 32px 0 0; font-size: .78rem; color: #3d3555; display: flex; gap: 8px; justify-content: center; align-items: center; flex-wrap: wrap; }
.dot { opacity: .4; }
</style>