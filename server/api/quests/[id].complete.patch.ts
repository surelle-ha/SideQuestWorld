/**
 * PATCH /api/quests/:id/complete
 * Mark a quest as resolved and record who helped.
 *
 * Body: CompleteQuestBody  { helpers: string[] }
 * Returns: QuestDto
 */
import { getDataSource } from '~~/server/db/data-source'
import { SosQuestSchema } from '~~/server/entities/SosQuest'
import { serializeQuest } from '~~/server/utils/quest.utils'
import { CompleteQuestBody } from '~~/types/quest'

export default defineEventHandler(async (event) => {
  const id   = getRouterParam(event, 'id')
  const body = await readBody<CompleteQuestBody>(event)

  if (!id) {
    throw createError({ statusCode: 400, message: 'Quest ID is required' })
  }

  const ds   = await getDataSource()
  const repo = ds.getRepository(SosQuestSchema)

  const quest = await repo.findOne({
    where: id.startsWith('SQW-') ? { ticketId: id } : { id },
    relations: ['heroes'],
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

  quest.status  = 'resolved'
  quest.helpers = helpers.length ? helpers.join(',') : null

  await repo.save(quest)

  const updated = await repo.findOne({ where: { id: quest.id }, relations: ['heroes'] })
  return serializeQuest(updated!)
})
