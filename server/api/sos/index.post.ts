// server/api/sos/index.post.ts
/**
 * POST /api/sos
 */
import prisma from '~~/server/db/prisma'
import type { CreateQuestBody } from '~~/types/quest'
import { generateTicketId, requireField, serializeQuest } from '~~/server/utils/quest.utils'

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateQuestBody>(event)

  const username = requireField(body?.username, 'username')
  const map      = requireField(body?.map,      'map')
  const roomId   = requireField(body?.roomId,   'roomId')

  const urgency = (['low', 'medium', 'high'] as const).includes(body?.urgency as never)
    ? body.urgency!
    : 'medium'

  const quest = await prisma.sosQuest.create({
    data: {
      ticketId: generateTicketId(),
      username,
      map,
      roomId,
      issue:    body?.issue?.trim() || null,
      urgency,
      isBoss:   Boolean(body?.isBoss),
      status:   'open',
      helpers:  null,
    },
    include: { heroes: true },
  })

  setResponseStatus(event, 201)
  return serializeQuest(quest)
})