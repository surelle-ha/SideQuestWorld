// server/api/leaderboard.get.ts
import prisma from '~~/server/db/prisma'

const RANKS = [
  { min: 5000, title: 'Legendary Hero',   emoji: '👑' },
  { min: 2000, title: 'Champion',          emoji: '🏆' },
  { min: 1000, title: 'Elite Knight',      emoji: '⚔️' },
  { min: 500,  title: 'Veteran Adventurer',emoji: '🛡️' },
  { min: 200,  title: 'Seasoned Hero',     emoji: '🌟' },
  { min: 100,  title: 'Hero',              emoji: '⭐' },
  { min: 0,    title: 'Apprentice',        emoji: '🗡️' },
]

export function getRank(points: number) {
  return RANKS.find(r => points >= r.min) ?? RANKS[RANKS.length - 1]
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 50, 100)

  const users = await prisma.user.findMany({
    orderBy: { heroPoints: 'desc' },
    take: limit,
    select: {
      id: true,
      sqwUsername: true,
      ingameUsername: true,
      heroPoints: true,
      createdAt: true,
    },
  })

  return users.map((u, i) => ({
    rank: i + 1,
    ...u,
    tier: getRank(u.heroPoints),
    createdAt: u.createdAt.toISOString(),
  }))
})