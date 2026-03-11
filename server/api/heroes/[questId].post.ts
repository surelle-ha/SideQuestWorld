/**
 * POST /api/heroes/:questId
 * Commit a hero (player) to help with an open quest.
 *
 * Body: CommitHeroBody  { username: string }
 * Returns: QuestDto (updated)
 */
import { getDataSource } from '../../db/data-source'
import { SosQuestSchema } from '../../entities/SosQuest'
import { QuestHeroSchema } from '../../entities/QuestHero'
import type { CommitHeroBody } from '../../../types/quest'

export default defineEventHandler(async (event) => {
  const questId = getRouterParam(event, 'questId')
  const body    = await readBody<CommitHeroBody>(event)

  if (!questId) {
    throw createError({ statusCode: 400, message: 'Quest ID is required' })
  }

  const username = requireField(body?.username, 'username')

  const ds        = await getDataSource()
  const questRepo = ds.getRepository(SosQuestSchema)
  const heroRepo  = ds.getRepository(QuestHeroSchema)

  const quest = await questRepo.findOne({
    where: questId.startsWith('SQW-') ? { ticketId: questId } : { id: questId },
    relations: ['heroes'],
  })

  if (!quest) {
    throw createError({ statusCode: 404, message: 'Quest not found' })
  }

  if (quest.status === 'resolved') {
    throw createError({ statusCode: 409, message: 'Cannot commit to a resolved quest' })
  }

  // Prevent duplicate commits
  const alreadyCommitted = quest.heroes?.some(
    h => h.username.toLowerCase() === username.toLowerCase()
  )

  if (alreadyCommitted) {
    throw createError({ statusCode: 409, message: 'You have already committed to this quest' })
  }

  const hero    = heroRepo.create()
  hero.username = username
  hero.questId  = quest.id
  await heroRepo.save(hero)

  const updated = await questRepo.findOne({ where: { id: quest.id }, relations: ['heroes'] })
  return serializeQuest(updated!)
})
