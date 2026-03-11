/**
 * POST /api/sos
 * Create a new SOS distress call.
 *
 * Body: CreateQuestBody
 * Returns: QuestDto
 */
import { getDataSource } from '../../db/data-source'
import { SosQuestSchema } from '../../entities/SosQuest'
import type { CreateQuestBody } from '../../../types/quest'
import { generateTicketId, requireField, serializeQuest } from '~~/server/utils/quest.utils'

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateQuestBody>(event)

  const username = requireField(body?.username, 'username')
  const map      = requireField(body?.map,      'map')
  const roomId   = requireField(body?.roomId,   'roomId')

  const urgency = (['low', 'medium', 'high'] as const).includes(body?.urgency as never)
    ? body.urgency!
    : 'medium'

  const ds   = await getDataSource()
  const repo = ds.getRepository(SosQuestSchema)

  const quest        = repo.create()
  quest.ticketId     = generateTicketId()
  quest.username     = username
  quest.map          = map
  quest.roomId       = roomId
  quest.issue        = body?.issue?.trim() || null
  quest.urgency      = urgency
  quest.isBoss       = Boolean(body?.isBoss)
  quest.status       = 'open'
  quest.helpers      = null

  await repo.save(quest)

  // Re-fetch with relations
  const saved = await repo.findOne({ where: { id: quest.id }, relations: ['heroes'] })

  setResponseStatus(event, 201)
  return serializeQuest(saved!)
})
