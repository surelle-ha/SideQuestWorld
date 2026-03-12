<template>
  <div>
      <div class="lb-hero">
        <div class="lb-title-tag">🏆 HALL OF HEROES</div>
        <h2 class="lb-title">Hero Leaderboard</h2>
        <p class="lb-desc">Earn Hero Points by completing quests. 100 points per quest!</p>
        <div class="points-info">
          <div class="pi-item">⚔️ Complete a quest = <strong>100 pts</strong></div>
          <div class="pi-item">🛡️ Help as a hero = <strong>100 pts</strong></div>
        </div>
      </div>

      <!-- Rank Legend -->
      <div class="rank-legend">
        <div v-for="rank in RANKS" :key="rank.title" class="rank-item">
          <span class="rank-emoji">{{ rank.emoji }}</span>
          <span class="rank-title">{{ rank.title }}</span>
          <span class="rank-pts">{{ rank.min.toLocaleString() }}+ pts</span>
        </div>
      </div>

      <!-- Top 3 Podium -->
      <div v-if="top3.length" class="podium">
        <div class="podium-slot silver" v-if="top3[1]">
          <div class="podium-avatar">{{ top3[1].sqwUsername[0].toUpperCase() }}</div>
          <div class="podium-rank">🥈</div>
          <div class="podium-name">{{ top3[1].sqwUsername }}</div>
          <div class="podium-pts">{{ top3[1].heroPoints.toLocaleString() }} pts</div>
          <div class="podium-tier">{{ top3[1].tier.emoji }} {{ top3[1].tier.title }}</div>
          <div class="podium-block silver-block">#2</div>
        </div>
        <div class="podium-slot gold" v-if="top3[0]">
          <div class="podium-crown">👑</div>
          <div class="podium-avatar gold-avatar">{{ top3[0].sqwUsername[0].toUpperCase() }}</div>
          <div class="podium-rank">🥇</div>
          <div class="podium-name">{{ top3[0].sqwUsername }}</div>
          <div class="podium-pts">{{ top3[0].heroPoints.toLocaleString() }} pts</div>
          <div class="podium-tier">{{ top3[0].tier.emoji }} {{ top3[0].tier.title }}</div>
          <div class="podium-block gold-block">#1</div>
        </div>
        <div class="podium-slot bronze" v-if="top3[2]">
          <div class="podium-avatar">{{ top3[2].sqwUsername[0].toUpperCase() }}</div>
          <div class="podium-rank">🥉</div>
          <div class="podium-name">{{ top3[2].sqwUsername }}</div>
          <div class="podium-pts">{{ top3[2].heroPoints.toLocaleString() }} pts</div>
          <div class="podium-tier">{{ top3[2].tier.emoji }} {{ top3[2].tier.title }}</div>
          <div class="podium-block bronze-block">#3</div>
        </div>
      </div>

      <!-- Full leaderboard table -->
      <div class="lb-card">
        <div v-if="loading" class="lb-loading">
          <span class="spinner"></span> Loading heroes...
        </div>
        <div v-else-if="!entries.length" class="lb-empty">
          <div class="empty-icon">🗡️</div>
          <p>No heroes yet. Complete quests to earn Hero Points!</p>
        </div>
        <template v-else>
          <div class="lb-table-header">
            <span class="th-rank">Rank</span>
            <span class="th-hero">Hero</span>
            <span class="th-tier">Tier</span>
            <span class="th-pts">Points</span>
          </div>
          <TransitionGroup name="list" tag="div" class="lb-list">
            <div
              v-for="entry in rest"
              :key="entry.id"
              class="lb-row"
              :class="{ 'is-me': user && entry.sqwUsername === user.sqwUsername }"
            >
              <span class="td-rank">#{{ entry.rank }}</span>
              <div class="td-hero">
                <div class="hero-avatar">{{ entry.sqwUsername[0].toUpperCase() }}</div>
                <div class="hero-info">
                  <span class="hero-name">{{ entry.sqwUsername }}</span>
                  <span class="hero-ingame">{{ entry.ingameUsername }}</span>
                </div>
              </div>
              <span class="td-tier">{{ entry.tier.emoji }} <span class="tier-name">{{ entry.tier.title }}</span></span>
              <span class="td-pts">{{ entry.heroPoints.toLocaleString() }}<span class="pts-label"> pts</span></span>
            </div>
          </TransitionGroup>
        </template>
      </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

import { useAuth } from '~/composables/useAuth'

const { user } = useAuth()

useHead({ title: 'Leaderboard — Side Quest World' })

const RANKS = [
  { min: 5000, title: 'Legendary Hero',    emoji: '👑' },
  { min: 2000, title: 'Champion',           emoji: '🏆' },
  { min: 1000, title: 'Elite Knight',       emoji: '⚔️' },
  { min: 500,  title: 'Veteran Adventurer', emoji: '🛡️' },
  { min: 200,  title: 'Seasoned Hero',      emoji: '🌟' },
  { min: 100,  title: 'Hero',               emoji: '⭐' },
  { min: 0,    title: 'Apprentice',         emoji: '🗡️' },
]

const loading = ref(true)
const entries = ref<any[]>([])

const top3 = computed(() => entries.value.slice(0, 3))
const rest = computed(() => entries.value.slice(3))

async function loadLeaderboard() {
  loading.value = true
  try {
    entries.value = await $fetch<any[]>('/api/leaderboard')
  } catch {
    entries.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadLeaderboard)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Nunito:wght@400;600;700;800&display=swap');
* { box-sizing: border-box; }

.lb-wrapper { min-height: 100vh; background: #0d0b1a; font-family: 'Nunito', sans-serif; position: relative; }
.bg-layer { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .35; }
.orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, #7c3aed, transparent 70%); top: -10%; left: -10%; animation: drift1 18s ease-in-out infinite; }
.orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, #a855f7, transparent 70%); bottom: -5%; right: -5%; animation: drift2 22s ease-in-out infinite; }
.orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, #d97706, transparent 70%); top: 30%; right: 20%; animation: drift3 15s ease-in-out infinite; }
.grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(196,181,253,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(196,181,253,.03) 1px, transparent 1px); background-size: 40px 40px; }
@keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px, 20px) scale(1.05); } }
@keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px, -30px) scale(1.08); } }
@keyframes drift3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(15px, -15px) scale(0.95); } }

.content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; padding: 0 20px 60px; }

.site-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 0 20px; gap: 16px; }
.logo-area { display: flex; align-items: center; gap: 12px; }
.logo-icon { font-size: 1.8rem; }
.logo-title { font-family: 'Cinzel', serif; font-size: 1.3rem; font-weight: 900; background: linear-gradient(135deg, #e2d9f3, #c4b5fd 50%, #f0abfc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
.logo-sub { color: #7c6fa0; font-size: .78rem; margin: 0; }
.back-btn { background: rgba(255,255,255,.05); border: 1px solid rgba(196,181,253,.2); border-radius: 8px; padding: 8px 16px; color: #c4b5fd; text-decoration: none; font-size: .82rem; font-weight: 700; transition: all .2s; }
.back-btn:hover { background: rgba(196,181,253,.1); }

.lb-hero { text-align: center; margin-bottom: 32px; }
.lb-title-tag { display: inline-block; background: linear-gradient(135deg, rgba(234,179,8,.2), rgba(251,191,36,.1)); border: 1px solid rgba(251,191,36,.3); color: #fbbf24; font-size: .68rem; font-weight: 700; letter-spacing: .15em; padding: 4px 14px; border-radius: 20px; margin-bottom: 10px; }
.lb-title { font-family: 'Cinzel', serif; font-size: 2rem; font-weight: 900; background: linear-gradient(135deg, #fde68a, #f59e0b 50%, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px; }
.lb-desc { color: #8b80a8; font-size: .9rem; margin: 0 0 16px; }
.points-info { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
.pi-item { background: rgba(124,58,237,.1); border: 1px solid rgba(196,181,253,.15); border-radius: 20px; padding: 6px 16px; font-size: .8rem; color: #a89bc4; }
.pi-item strong { color: #c4b5fd; }

.rank-legend { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 28px; }
.rank-item { background: rgba(255,255,255,.03); border: 1px solid rgba(196,181,253,.1); border-radius: 20px; padding: 5px 12px; display: flex; align-items: center; gap: 6px; }
.rank-emoji { font-size: .9rem; }
.rank-title { font-size: .72rem; font-weight: 700; color: #8b80a8; }
.rank-pts { font-size: .68rem; color: #4b4569; }

/* Podium */
.podium { display: flex; align-items: flex-end; justify-content: center; gap: 12px; margin-bottom: 32px; }
.podium-slot { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 130px; }
.podium-crown { font-size: 1.6rem; margin-bottom: 2px; }
.podium-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; color: #fff; font-family: 'Cinzel', serif; border: 2px solid rgba(196,181,253,.3); }
.podium-avatar.gold-avatar { width: 64px; height: 64px; font-size: 1.7rem; border: 2px solid rgba(251,191,36,.5); background: linear-gradient(135deg, #92400e, #b45309); }
.podium-rank { font-size: 1.4rem; }
.podium-name { font-family: 'Cinzel', serif; font-size: .82rem; color: #e2d9f3; font-weight: 700; text-align: center; }
.podium-pts { font-size: .78rem; font-weight: 800; color: #c4b5fd; }
.podium-tier { font-size: .7rem; color: #7c6fa0; }
.podium-block { border-radius: 8px 8px 0 0; width: 100%; text-align: center; font-family: 'Cinzel', serif; font-weight: 900; font-size: .85rem; color: rgba(0,0,0,.5); padding: 8px 0; }
.gold-block   { background: linear-gradient(135deg, #fbbf24, #f59e0b); height: 60px; line-height: 44px; }
.silver-block { background: linear-gradient(135deg, #9ca3af, #6b7280); height: 45px; line-height: 28px; }
.bronze-block { background: linear-gradient(135deg, #92400e, #78350f); height: 32px; line-height: 16px; color: rgba(255,200,150,.6); }

.lb-card { background: rgba(255,255,255,.03); border: 1px solid rgba(196,181,253,.12); border-radius: 20px; overflow: hidden; }
.lb-loading, .lb-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 20px; color: #5c5278; font-size: .9rem; }
.spinner { width: 24px; height: 24px; border: 2px solid rgba(196,181,253,.2); border-top-color: #c4b5fd; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-icon { font-size: 2.5rem; }

.lb-table-header { display: grid; grid-template-columns: 60px 1fr 160px 100px; padding: 12px 20px; background: rgba(196,181,253,.05); border-bottom: 1px solid rgba(196,181,253,.08); }
.lb-table-header span { font-size: .72rem; font-weight: 700; color: #5c5278; text-transform: uppercase; letter-spacing: .08em; }

.lb-row { display: grid; grid-template-columns: 60px 1fr 160px 100px; align-items: center; padding: 14px 20px; border-bottom: 1px solid rgba(196,181,253,.06); transition: background .15s; }
.lb-row:last-child { border-bottom: none; }
.lb-row:hover { background: rgba(196,181,253,.04); }
.lb-row.is-me { background: rgba(124,58,237,.08); border-left: 3px solid #7c3aed; }

.td-rank { font-family: 'Cinzel', serif; font-size: .9rem; font-weight: 700; color: #5c5278; }
.td-hero { display: flex; align-items: center; gap: 12px; }
.hero-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #4c1d95, #7c3aed); display: flex; align-items: center; justify-content: center; font-family: 'Cinzel', serif; font-size: .9rem; font-weight: 900; color: #c4b5fd; flex-shrink: 0; }
.hero-info { display: flex; flex-direction: column; }
.hero-name { font-weight: 700; color: #e2d9f3; font-size: .88rem; }
.hero-ingame { font-size: .72rem; color: #5c5278; }
.td-tier { font-size: .82rem; color: #9ca3af; display: flex; align-items: center; gap: 6px; }
.tier-name { color: #7c6fa0; }
.td-pts { font-size: .92rem; font-weight: 800; color: #c4b5fd; text-align: right; }
.pts-label { font-size: .7rem; color: #5c5278; font-weight: 600; }

.list-move, .list-enter-active, .list-leave-active { transition: all .4s ease; }
.list-enter-from { opacity: 0; transform: translateX(-20px); }
.list-leave-to { opacity: 0; }

.site-footer { text-align: center; padding: 32px 0 0; font-size: .78rem; color: #3d3555; display: flex; gap: 8px; justify-content: center; align-items: center; flex-wrap: wrap; }
.dot { opacity: .4; }

@media (max-width: 560px) {
  .lb-table-header { grid-template-columns: 44px 1fr 80px; }
  .lb-table-header .th-tier { display: none; }
  .lb-row { grid-template-columns: 44px 1fr 80px; }
  .td-tier { display: none; }
  .podium { gap: 6px; }
  .podium-slot { min-width: 90px; }
}
</style>