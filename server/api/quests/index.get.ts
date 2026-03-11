/**
 * GET /api/quests
 * List quests for the public Quest Board.
 *
 * Query params:
 *   status  — 'open' | 'resolved' | 'all'  (default: 'open')
 *   boss    — 'true' to filter boss-only
 *   limit   — number (default 50, max 100)
 *   offset  — number (default 0)
 *
 * Returns: { quests: QuestDto[], total: number }
 */
import { serializeQuest } from '~~/server/utils/quest.utils'
import { getDataSource } from '../../db/data-source'
import { SosQuestSchema } from '../../entities/SosQuest'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const status = String(query.status || 'open')
  const bossOnly = query.boss === 'true'
  const limit  = Math.min(Number(query.limit)  || 50, 100)
  const offset = Math.max(Number(query.offset) || 0,  0)

  const ds   = await getDataSource()
  const repo = ds.getRepository(SosQuestSchema)

  const qb = repo
    .createQueryBuilder('quest')
    .leftJoinAndSelect('quest.heroes', 'heroes')
    .orderBy('quest.createdAt', 'DESC')
    .take(limit)
    .skip(offset)

  if (status !== 'all') {
    qb.andWhere('quest.status = :status', { status })
  }

  if (bossOnly) {
    qb.andWhere('quest.isBoss = true')
  }

  const [quests, total] = await qb.getManyAndCount()

  return {
    quests: quests.map(serializeQuest),
    total,
    limit,
    offset,
  }
})
