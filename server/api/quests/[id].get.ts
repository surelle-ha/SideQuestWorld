// server/api/quests/[id].get.ts
/**
 * GET /api/quests/:id
 */
import prisma from '~~/server/db/prisma'
import { serializeQuest } from '~~/server/utils/quest.utils'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'Quest ID is required' })
  }

  const quest = await prisma.sosQuest.findFirst({
    where: id.startsWith('SQW-') ? { ticketId: id } : { id },
    include: { heroes: true },
  })

  if (!quest) {
    throw createError({ statusCode: 404, message: 'Quest not found' })
  }

  return serializeQuest(quest)
})