// server/api/quests/index.get.ts
/**
 * GET /api/quests
 */
import prisma from '~~/server/db/prisma'
import { serializeQuest } from '~~/server/utils/quest.utils'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const status   = String(query.status || 'open')
  const bossOnly = query.boss === 'true'
  const limit    = Math.min(Number(query.limit)  || 50, 100)
  const offset   = Math.max(Number(query.offset) || 0,  0)

  const where = {
    ...(status !== 'all' ? { status } : {}),
    ...(bossOnly         ? { isBoss: true } : {}),
  }

  const [quests, total] = await prisma.$transaction([
    prisma.sosQuest.findMany({
      where,
      include: { heroes: true },
      orderBy: { createdAt: 'desc' },
      take:    limit,
      skip:    offset,
    }),
    prisma.sosQuest.count({ where }),
  ])

  return {
    quests: quests.map(serializeQuest),
    total,
    limit,
    offset,
  }
})