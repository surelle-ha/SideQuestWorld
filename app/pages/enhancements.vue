<template>
  <div>
    <!-- Dev Banner -->
    <div class="dev-banner">
      <span class="dev-badge">🚧 IN DEVELOPMENT</span>
      <p>Enhancement ratings are being built out. What you see below is a <strong>preview</strong> of the upcoming feature — submit your AQW class enhancements and let the community vote!</p>
    </div>

    <div class="eq-hero">
      <div class="eq-title-tag">✨ ENHANCEMENT RATER</div>
      <h2 class="eq-title">AQW Class Enhancements</h2>
      <p class="eq-desc">Browse community-submitted enhancement builds per class, rate setups, and discover the meta.</p>
    </div>

    <!-- Class Filter Tabs -->
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

    <!-- Enhancement Cards -->
    <div class="eq-grid">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="eq-card"
        :class="item.tier"
      >
        <div class="eq-card-top">
          <div class="rarity-gem" :class="item.tier"></div>
          <span class="rarity-label" :class="item.tier">{{ tierLabel(item.tier) }}</span>
          <span class="eq-class">{{ item.classIcon }} {{ item.className }}</span>
        </div>

        <div class="eq-icon-wrap" :class="item.tier">
          <span class="eq-icon">{{ item.icon }}</span>
        </div>

        <h3 class="eq-name">{{ item.name }}</h3>
        <p class="eq-stats-label">Enhancement Slots</p>

        <div class="eq-stats">
          <div v-for="slot in item.slots" :key="slot.slot" class="stat-row">
            <span class="stat-name">{{ slot.slot }}</span>
            <span class="slot-enh" :class="item.tier">{{ slot.enhancement }}</span>
            <span class="slot-focus">{{ slot.focus }}</span>
          </div>
        </div>

        <!-- Playstyle Tags -->
        <div class="tags-row">
          <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <!-- Rating -->
        <div class="eq-rating">
          <div class="stars-row">
            <button
              v-for="star in 5"
              :key="star"
              class="star-btn"
              :class="{ filled: star <= (userRatings[item.id] || 0) }"
              @click="rateItem(item.id, star)"
            >★</button>
          </div>
          <span class="rating-text">
            {{ item.communityRating.toFixed(1) }} / 5
            <span class="rating-count">({{ item.rateCount }} votes)</span>
          </span>
        </div>

        <div class="eq-actions">
          <button class="eq-btn preview" @click="previewItem = item">🔍 Details</button>
          <button class="eq-btn rate" @click="openRateModal(item)">⭐ Rate</button>
        </div>
      </div>
    </div>

    <!-- Submit Build CTA -->
    <div class="submit-cta">
      <div class="cta-content">
        <span class="cta-icon">📋</span>
        <div>
          <h3>Share Your Enhancement Build</h3>
          <p>Submit your optimized enhancement setup per AQW class and get rated by the community.</p>
        </div>
      </div>
      <div class="cta-right">
        <span class="soon-pill">Coming Soon</span>
        <button class="cta-btn" disabled>Submit Build</button>
      </div>
    </div>

    <!-- Feature Preview Notice -->
    <div class="feature-notice">
      <div class="fn-icon">🛠️</div>
      <div class="fn-body">
        <h4>Feature Under Active Development</h4>
        <p>Planned features include: user-submitted builds, class filtering, verified meta badges, comment threads, and build comparison tools. Stay tuned for updates!</p>
      </div>
    </div>

    <footer class="site-footer">
      <span>Side Quest World</span>
      <span class="dot">·</span>
      <span>AQW Enhancements</span>
      <span class="dot">·</span>
      <span>Heroes Never Quit</span>
    </footer>

    <!-- Preview Modal -->
    <Transition name="modal-fade">
      <div v-if="previewItem" class="modal-backdrop" @click.self="previewItem = null">
        <div class="modal preview-modal" :class="previewItem.tier">
          <div class="pm-header">
            <div class="pm-icon-wrap" :class="previewItem.tier">
              <span class="pm-icon">{{ previewItem.icon }}</span>
            </div>
            <div>
              <div class="pm-rarity" :class="previewItem.tier">{{ tierLabel(previewItem.tier) }}</div>
              <h3 class="pm-name">{{ previewItem.name }}</h3>
              <p class="pm-class">{{ previewItem.classIcon }} {{ previewItem.className }}</p>
            </div>
          </div>

          <p class="pm-lore">"{{ previewItem.description }}"</p>

          <p class="pm-section-label">Enhancement Slots</p>
          <div class="pm-slots">
            <div v-for="slot in previewItem.slots" :key="slot.slot" class="pm-slot-row">
              <span class="pm-slot-name">{{ slot.slot }}</span>
              <span class="pm-enh-name" :class="previewItem.tier">{{ slot.enhancement }}</span>
              <span class="pm-enh-focus">{{ slot.focus }}</span>
            </div>
          </div>

          <p class="pm-section-label">Playstyle</p>
          <div class="tags-row">
            <span v-for="tag in previewItem.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>

          <div class="pm-community">
            <span class="pm-rating-label">Community Rating</span>
            <div class="stars-row large">
              <span v-for="s in 5" :key="s" class="star" :class="{ filled: s <= previewItem.communityRating }">★</span>
            </div>
            <span class="pm-rating-val">{{ previewItem.communityRating.toFixed(1) }} / 5 ({{ previewItem.rateCount }} votes)</span>
          </div>

          <button class="modal-close-btn" @click="previewItem = null">Close</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useHead({ title: 'AQW Enhancements — Side Quest World' })

interface EnhSlot { slot: string; enhancement: string; focus: string }
interface EnhItem {
  id: number
  name: string
  icon: string
  tier: string
  className: string
  classIcon: string
  description: string
  slots: EnhSlot[]
  tags: string[]
  communityRating: number
  rateCount: number
  category: string
}

const categories = [
  { value: 'all',       label: 'All Classes',   icon: '🗂️' },
  { value: 'warrior',   label: 'Warrior',        icon: '⚔️' },
  { value: 'mage',      label: 'Mage',           icon: '🔮' },
  { value: 'rogue',     label: 'Rogue',          icon: '🗡️' },
  { value: 'healer',    label: 'Healer',         icon: '💊' },
  { value: 'support',   label: 'Support',        icon: '🛡️' },
]

const activeCategory = ref('all')
const userRatings = reactive<Record<number, number>>({})
const previewItem = ref<EnhItem | null>(null)

const mockItems: EnhItem[] = [
  {
    id: 1, name: 'Full Wizard Build', icon: '🔮', tier: 'legendary',
    className: 'Legion Revenant', classIcon: '💀', category: 'mage',
    description: 'Maximum spell damage output for farming and boss soloing. Full Wizard dominates with LR\'s mana cycling.',
    slots: [
      { slot: 'Helm',   enhancement: 'Wizard',   focus: 'INT +45%' },
      { slot: 'Armor',  enhancement: 'Wizard',   focus: 'INT +45%' },
      { slot: 'Cape',   enhancement: 'Wizard',   focus: 'INT +45%' },
      { slot: 'Weapon', enhancement: 'Wizard',   focus: 'INT +45%' },
    ],
    tags: ['Farming', 'Solo Boss', 'DPS', 'Meta'],
    communityRating: 4.9, rateCount: 512,
  },
  {
    id: 2, name: 'Lucky Hybrid Setup', icon: '🍀', tier: 'epic',
    className: 'Archfiend', classIcon: '😈', category: 'mage',
    description: 'Lucky crit build that maximizes DoT damage with high crit rates. Popular for Archfiend\'s stacking debuffs.',
    slots: [
      { slot: 'Helm',   enhancement: 'Lucky',        focus: 'LUK +45%' },
      { slot: 'Armor',  enhancement: 'Lucky',        focus: 'LUK +45%' },
      { slot: 'Cape',   enhancement: 'Spellbreaker', focus: 'INT/LUK' },
      { slot: 'Weapon', enhancement: 'Lucky',        focus: 'LUK +45%' },
    ],
    tags: ['DoT', 'Crit', 'Hybrid', 'PvP'],
    communityRating: 4.4, rateCount: 298,
  },
  {
    id: 3, name: 'Fighter Tank Build', icon: '🛡️', tier: 'rare',
    className: 'Paladin', classIcon: '✨', category: 'healer',
    description: 'Survivability-focused setup using Fighter for STR/END balance. Ideal for duo and group farming.',
    slots: [
      { slot: 'Helm',   enhancement: 'Fighter',  focus: 'STR +45%' },
      { slot: 'Armor',  enhancement: 'Fighter',  focus: 'STR +45%' },
      { slot: 'Cape',   enhancement: 'Acolyte',  focus: 'WIS/END' },
      { slot: 'Weapon', enhancement: 'Fighter',  focus: 'STR +45%' },
    ],
    tags: ['Tank', 'Group', 'Survivability'],
    communityRating: 3.8, rateCount: 167,
  },
  {
    id: 4, name: 'Thief of Hours Speed', icon: '⚡', tier: 'epic',
    className: 'Evolved Shaman', classIcon: '🌀', category: 'support',
    description: 'Thief of Hours enhancements maximize Haste for faster skill rotations. Excellent for speed farming.',
    slots: [
      { slot: 'Helm',   enhancement: 'Thief of Hours', focus: 'DEX/LUK' },
      { slot: 'Armor',  enhancement: 'Thief of Hours', focus: 'DEX/LUK' },
      { slot: 'Cape',   enhancement: 'Thief of Hours', focus: 'DEX/LUK' },
      { slot: 'Weapon', enhancement: 'Lucky',          focus: 'LUK +45%' },
    ],
    tags: ['Speed Farm', 'Haste', 'DEX', 'Speedrun'],
    communityRating: 4.2, rateCount: 231,
  },
  {
    id: 5, name: 'Acolyte Healer Build', icon: '💊', tier: 'uncommon',
    className: 'Undead Slayer', classIcon: '🕯️', category: 'healer',
    description: 'Pure WIS healer setup for support roles in party play. Great for those who prefer utility over damage.',
    slots: [
      { slot: 'Helm',   enhancement: 'Acolyte',  focus: 'WIS +45%' },
      { slot: 'Armor',  enhancement: 'Acolyte',  focus: 'WIS +45%' },
      { slot: 'Cape',   enhancement: 'Acolyte',  focus: 'WIS +45%' },
      { slot: 'Weapon', enhancement: 'Acolyte',  focus: 'WIS +45%' },
    ],
    tags: ['Healer', 'Support', 'Party', 'WIS'],
    communityRating: 4.0, rateCount: 88,
  },
  {
    id: 6, name: 'Intercessor Rogue Max', icon: '🗡️', tier: 'legendary',
    className: 'Chaos Slayer Berserker', classIcon: '🔥', category: 'warrior',
    description: 'Intercessor enhancements built around maximizing raw physical crits for Berserker\'s rage stacks.',
    slots: [
      { slot: 'Helm',   enhancement: 'Fighter',      focus: 'STR +45%' },
      { slot: 'Armor',  enhancement: 'Fighter',      focus: 'STR +45%' },
      { slot: 'Cape',   enhancement: 'Intercessor',  focus: 'STR/LUK' },
      { slot: 'Weapon', enhancement: 'Intercessor',  focus: 'STR/LUK' },
    ],
    tags: ['Berserker', 'Crit', 'Physical DPS', 'Meta'],
    communityRating: 4.7, rateCount: 389,
  },
]

const filteredItems = computed(() =>
  activeCategory.value === 'all'
    ? mockItems
    : mockItems.filter(i => i.category === activeCategory.value)
)

function rateItem(id: number, stars: number) {
  userRatings[id] = stars
}
function openRateModal(item: EnhItem) {
  previewItem.value = item
}
function tierLabel(tier: string) {
  const map: Record<string,string> = {
    legendary: '🌟 Meta',
    epic: '🔥 Strong',
    rare: '✅ Solid',
    uncommon: '💡 Niche',
    common: '📖 Basic',
  }
  return map[tier] ?? tier
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Nunito:wght@400;600;700;800&display=swap');
* { box-sizing: border-box; }

/* Dev Banner */
.dev-banner {
  background: rgba(234,179,8,.07);
  border: 1px solid rgba(234,179,8,.25);
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.dev-badge {
  background: rgba(234,179,8,.2);
  border: 1px solid rgba(234,179,8,.4);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: .68rem;
  font-weight: 800;
  color: #fbbf24;
  letter-spacing: .1em;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 2px;
}
.dev-banner p {
  font-size: .82rem;
  color: #9ca3af;
  margin: 0;
  line-height: 1.6;
}
.dev-banner strong { color: #fbbf24; }

/* Hero */
.eq-hero { text-align: center; margin-bottom: 28px; }
.eq-title-tag {
  display: inline-block;
  background: linear-gradient(135deg, rgba(16,185,129,.15), rgba(52,211,153,.08));
  border: 1px solid rgba(52,211,153,.3);
  color: #34d399;
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .15em;
  padding: 4px 14px;
  border-radius: 20px;
  margin-bottom: 10px;
}
.eq-title {
  font-family: 'Cinzel', serif;
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, #a7f3d0, #34d399 50%, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px;
}
.eq-desc { color: #8b80a8; font-size: .9rem; margin: 0; }

/* Category Tabs */
.cat-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
.cat-tab {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(52,211,153,.12);
  border-radius: 20px;
  padding: 7px 16px;
  font-family: 'Nunito', sans-serif;
  font-size: .8rem;
  font-weight: 700;
  color: #5c7a6a;
  cursor: pointer;
  transition: all .2s;
}
.cat-tab:hover { border-color: rgba(52,211,153,.28); color: #34d399; }
.cat-tab.active { background: rgba(16,185,129,.15); border-color: rgba(52,211,153,.45); color: #34d399; }

/* Tier colors */
.legendary { --rarity-color: #f59e0b; --rarity-bg: rgba(245,158,11,.13); --rarity-border: rgba(245,158,11,.32); }
.epic      { --rarity-color: #a855f7; --rarity-bg: rgba(168,85,247,.13); --rarity-border: rgba(168,85,247,.32); }
.rare      { --rarity-color: #3b82f6; --rarity-bg: rgba(59,130,246,.13); --rarity-border: rgba(59,130,246,.28); }
.uncommon  { --rarity-color: #22c55e; --rarity-bg: rgba(34,197,94,.1);  --rarity-border: rgba(34,197,94,.28); }
.common    { --rarity-color: #9ca3af; --rarity-bg: rgba(156,163,175,.08); --rarity-border: rgba(156,163,175,.22); }

/* Grid */
.eq-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 16px; margin-bottom: 28px; }

.eq-card {
  background: rgba(255,255,255,.025);
  border: 1px solid var(--rarity-border, rgba(52,211,153,.12));
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all .22s;
  position: relative;
  overflow: hidden;
}
.eq-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--rarity-bg, transparent);
  opacity: .25;
  pointer-events: none;
}
.eq-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,.4); border-color: var(--rarity-color, rgba(52,211,153,.3)); }

.eq-card-top { display: flex; align-items: center; gap: 8px; }
.rarity-gem { width: 8px; height: 8px; border-radius: 50%; background: var(--rarity-color); box-shadow: 0 0 6px var(--rarity-color); flex-shrink: 0; }
.rarity-label { font-size: .68rem; font-weight: 800; color: var(--rarity-color); letter-spacing: .06em; }
.eq-class { margin-left: auto; font-size: .72rem; color: #5c5278; }

.eq-icon-wrap { width: 64px; height: 64px; border-radius: 14px; background: var(--rarity-bg); border: 2px solid var(--rarity-border); display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.eq-icon { font-size: 2rem; }
.eq-name { font-family: 'Cinzel', serif; font-size: .95rem; font-weight: 700; color: var(--rarity-color); margin: 0; text-align: center; }
.eq-stats-label { font-size: .65rem; font-weight: 700; color: #4b4569; text-transform: uppercase; letter-spacing: .1em; margin: 0; }

/* Slot rows */
.eq-stats { display: flex; flex-direction: column; gap: 5px; }
.stat-row { display: flex; align-items: center; gap: 8px; }
.stat-name { font-size: .68rem; font-weight: 700; color: #7c6fa0; width: 44px; flex-shrink: 0; }
.slot-enh { font-size: .72rem; font-weight: 700; color: var(--rarity-color); flex: 1; }
.slot-focus { font-size: .65rem; color: #4b4569; white-space: nowrap; }

/* Tags */
.tags-row { display: flex; flex-wrap: wrap; gap: 5px; }
.tag {
  background: rgba(52,211,153,.08);
  border: 1px solid rgba(52,211,153,.18);
  border-radius: 10px;
  padding: 2px 9px;
  font-size: .65rem;
  font-weight: 700;
  color: #34d399;
  letter-spacing: .04em;
}

/* Ratings */
.eq-rating { display: flex; align-items: center; gap: 10px; }
.stars-row { display: flex; gap: 2px; }
.stars-row.large { gap: 4px; }
.star-btn { background: none; border: none; cursor: pointer; font-size: 1.1rem; color: #3d3555; padding: 0; transition: all .15s; line-height: 1; }
.star-btn.filled { color: #f59e0b; text-shadow: 0 0 8px rgba(245,158,11,.4); }
.star-btn:hover { transform: scale(1.2); }
.star { font-size: 1.2rem; color: #3d3555; }
.star.filled { color: #f59e0b; text-shadow: 0 0 8px rgba(245,158,11,.4); }
.rating-text { font-size: .74rem; color: #7c6fa0; font-weight: 600; }
.rating-count { color: #4b4569; font-weight: 400; }

.eq-actions { display: flex; gap: 8px; }
.eq-btn { flex: 1; border-radius: 8px; padding: 8px; font-family: 'Nunito', sans-serif; font-size: .78rem; font-weight: 700; cursor: pointer; transition: all .2s; border: 1px solid; }
.eq-btn.preview { background: rgba(255,255,255,.04); border-color: rgba(196,181,253,.18); color: #8b80a8; }
.eq-btn.preview:hover { background: rgba(196,181,253,.08); color: #c4b5fd; }
.eq-btn.rate { background: var(--rarity-bg); border-color: var(--rarity-border); color: var(--rarity-color); }
.eq-btn.rate:hover { filter: brightness(1.15); }

/* Submit CTA */
.submit-cta {
  background: rgba(255,255,255,.02);
  border: 1px dashed rgba(52,211,153,.15);
  border-radius: 16px;
  padding: 22px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.cta-content { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 200px; }
.cta-icon { font-size: 1.9rem; }
.cta-content h3 { font-family: 'Cinzel', serif; font-size: .9rem; color: #7c6fa0; margin: 0 0 4px; }
.cta-content p { font-size: .78rem; color: #4b4569; margin: 0; }
.cta-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.soon-pill {
  background: rgba(234,179,8,.1);
  border: 1px solid rgba(234,179,8,.25);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: .68rem;
  font-weight: 700;
  color: #fbbf24;
  letter-spacing: .08em;
}
.cta-btn {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(52,211,153,.12);
  border-radius: 8px;
  padding: 10px 20px;
  font-family: 'Nunito', sans-serif;
  font-size: .82rem;
  font-weight: 700;
  color: #4b4569;
  cursor: not-allowed;
}

/* Feature Notice */
.feature-notice {
  background: rgba(16,185,129,.04);
  border: 1px solid rgba(52,211,153,.12);
  border-radius: 14px;
  padding: 18px 22px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 32px;
}
.fn-icon { font-size: 1.6rem; flex-shrink: 0; margin-top: 2px; }
.fn-body h4 { font-family: 'Cinzel', serif; font-size: .88rem; color: #34d399; margin: 0 0 6px; }
.fn-body p { font-size: .78rem; color: #5c7a6a; margin: 0; line-height: 1.65; }

/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.82); backdrop-filter: blur(8px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal { background: #0e1a14; border-radius: 22px; padding: 30px; max-width: 460px; width: 100%; box-shadow: 0 40px 100px rgba(0,0,0,.7); display: flex; flex-direction: column; gap: 14px; }
.preview-modal { border: 1px solid var(--rarity-border); }
.pm-header { display: flex; align-items: center; gap: 14px; }
.pm-icon-wrap { width: 60px; height: 60px; border-radius: 14px; background: var(--rarity-bg); border: 2px solid var(--rarity-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pm-icon { font-size: 1.9rem; }
.pm-rarity { font-size: .68rem; font-weight: 800; color: var(--rarity-color); letter-spacing: .1em; margin-bottom: 4px; }
.pm-name { font-family: 'Cinzel', serif; font-size: 1.1rem; font-weight: 900; color: #e2f5ec; margin: 0 0 2px; }
.pm-class { font-size: .76rem; color: #4b6b56; margin: 0; }
.pm-lore { font-size: .8rem; color: #5c7a6a; font-style: italic; border-left: 2px solid var(--rarity-border); padding-left: 12px; margin: 0; line-height: 1.65; }
.pm-section-label { font-size: .65rem; font-weight: 700; color: #4b4569; text-transform: uppercase; letter-spacing: .1em; margin: 0; }
.pm-slots { display: flex; flex-direction: column; gap: 6px; }
.pm-slot-row { display: flex; align-items: center; gap: 10px; }
.pm-slot-name { font-size: .7rem; font-weight: 700; color: #5c5278; width: 48px; flex-shrink: 0; }
.pm-enh-name { font-size: .76rem; font-weight: 700; color: var(--rarity-color); flex: 1; }
.pm-enh-focus { font-size: .68rem; color: #4b4569; }
.pm-community { display: flex; flex-direction: column; gap: 6px; align-items: center; background: rgba(255,255,255,.03); border-radius: 12px; padding: 14px; }
.pm-rating-label { font-size: .68rem; font-weight: 700; color: #4b6b56; text-transform: uppercase; letter-spacing: .08em; }
.pm-rating-val { font-size: .78rem; color: #5c7a6a; }
.modal-close-btn { background: rgba(255,255,255,.05); border: 1px solid rgba(52,211,153,.18); border-radius: 10px; padding: 11px; font-family: 'Nunito', sans-serif; font-size: .88rem; font-weight: 700; color: #5c7a6a; cursor: pointer; transition: all .2s; }
.modal-close-btn:hover { background: rgba(52,211,153,.1); color: #34d399; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* Footer */
.site-footer { text-align: center; padding: 32px 0 0; font-size: .78rem; color: #3d3555; display: flex; gap: 8px; justify-content: center; align-items: center; flex-wrap: wrap; }
.dot { opacity: .4; }
</style>