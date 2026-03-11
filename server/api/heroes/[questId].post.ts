// server/api/heroes/[questId].post.ts
import prisma from '~~/server/db/prisma'
import { requireField, serializeQuest } from '~~/server/utils/quest.utils'
import type { CommitHeroBody } from '~~/types/quest'
import type { QuestHero } from '~~/server/entities/QuestHero'

export default defineEventHandler(async (event) => {
  const questId = getRouterParam(event, 'questId')
  const body    = await readBody<CommitHeroBody>(event)

  if (!questId) {
    throw createError({ statusCode: 400, message: 'Quest ID is required' })
  }

  const username = requireField(body?.username, 'username')

  const quest = await prisma.sosQuest.findFirst({
    where:   questId.startsWith('SQW-') ? { ticketId: questId } : { id: questId },
    include: { heroes: true },
  })

  if (!quest) {
    throw createError({ statusCode: 404, message: 'Quest not found' })
  }

  if (quest.status === 'resolved') {
    throw createError({ statusCode: 409, message: 'Cannot commit to a resolved quest' })
  }

  const alreadyCommitted = quest.heroes?.some(
    (h: QuestHero) => h.username.toLowerCase() === username.toLowerCase()
  )

  if (alreadyCommitted) {
    throw createError({ statusCode: 409, message: 'You have already committed to this quest' })
  }

  await prisma.questHero.create({
    data: { username, questId: quest.id },
  })

  const updated = await prisma.sosQuest.findUnique({
    where:   { id: quest.id },
    include: { heroes: true },
  })

  return serializeQuest(updated!)
})