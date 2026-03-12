// server/api/quests/[id]/complete.patch.ts
// Awards 100 Hero Points to the quest owner + each committed hero on completion
import prisma from '~~/server/db/prisma'
import { serializeQuest } from '~~/server/utils/quest.utils'
import type { CompleteQuestBody } from '~~/types/quest'

const POINTS_PER_QUEST = 100

export default defineEventHandler(async (event) => {
  const id   = getRouterParam(event, 'id')
  const body = await readBody<CompleteQuestBody>(event)

  if (!id) throw createError({ statusCode: 400, message: 'Quest ID is required' })

  const quest = await prisma.sosQuest.findFirst({
    where: id.startsWith('SQW-') ? { ticketId: id } : { id },
    include: { heroes: true },
  })

  if (!quest) throw createError({ statusCode: 404, message: 'Quest not found' })
  if (quest.status === 'resolved') throw createError({ statusCode: 409, message: 'Quest is already resolved' })

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

  // Award Hero Points to participants (quest owner + heroes + tagged helpers)
  const awardUsernames = new Set<string>([
    quest.username,
    ...quest.heroes.map(h => h.username),
    ...helpers,
  ])

  await Promise.allSettled(
    [...awardUsernames].map(username =>
      prisma.user.updateMany({
        where: { sqwUsername: username },
        data: { heroPoints: { increment: POINTS_PER_QUEST } },
      })
    )
  )

  return serializeQuest(updated)
})