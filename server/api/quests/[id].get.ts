/**
 * GET /api/quests/:id
 * Fetch a single quest by UUID or ticketId (e.g. SQW-A3F9X2).
 *
 * Returns: QuestDto
 */
import { serializeQuest } from '~~/server/utils/quest.utils'
import { getDataSource } from '../../db/data-source'
import { SosQuestSchema } from '../../entities/SosQuest'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'Quest ID is required' })
  }

  const ds   = await getDataSource()
  const repo = ds.getRepository(SosQuestSchema)

  // Support both UUID and ticketId (SQW-XXXXXX)
  const quest = await repo.findOne({
    where: id.startsWith('SQW-')
      ? { ticketId: id }
      : { id },
    relations: ['heroes'],
  })

  if (!quest) {
    throw createError({ statusCode: 404, message: 'Quest not found' })
  }

  return serializeQuest(quest)
})
