// server/api/quests/[id]/complete.patch.ts
import prisma from '~~/server/db/prisma'
import { serializeQuest } from '~~/server/utils/quest.utils'
import type { CompleteQuestBody } from '~~/types/quest'

export default defineEventHandler(async (event) => {
  const id   = getRouterParam(event, 'id')
  const body = await readBody<CompleteQuestBody>(event)

  if (!id) {
    throw createError({ statusCode: 400, message: 'Quest ID is required' })
  }

  const quest = await prisma.sosQuest.findFirst({
    where: id.startsWith('SQW-') ? { ticketId: id } : { id },
  })

  if (!quest) {
    throw createError({ statusCode: 404, message: 'Quest not found' })
  }

  if (quest.status === 'resolved') {
    throw createError({ statusCode: 409, message: 'Quest is already resolved' })
  }

  const helpers = Array.isArray(body?.helpers)
    ? body.helpers.map((h: string) => String(h).trim()).filter(Boolean)
    : []

  const updated = await prisma.sosQuest.update({
    where: { id: quest.id },
    data: {
      status:  'resolved',
      helpers: helpers.length ? helpers.join(',') : null,
    },
    include: { heroes: true },
  })

  return serializeQuest(updated)
})