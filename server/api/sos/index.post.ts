// server/api/sos/index.post.ts
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

  // ── Limit: 1 open SOS per username ──────────────────────
  const existing = await prisma.sosQuest.findFirst({
    where: { username, status: 'open' },
  })

  if (existing) {
    throw createError({
      statusCode: 409,
      message: 'You already have an open SOS quest. Please resolve it before sending a new one.',
    })
  }

  const quest = await prisma.sosQuest.create({
    data: {
      ticketId: generateTicketId(),
      username,
      map,
      roomId,
      issue:   body?.issue?.trim() || null,
      urgency,
      isBoss:  Boolean(body?.isBoss),
      status:  'open',
      helpers: null,
    },
    include: { heroes: true },
  })

  setResponseStatus(event, 201)
  return serializeQuest(quest)
})