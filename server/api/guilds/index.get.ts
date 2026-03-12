// server/api/guilds/index.get.ts
import prisma from '~~/server/db/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = query.search ? String(query.search) : undefined
  const playstyle = query.playstyle ? String(query.playstyle) : undefined
  const server = query.server ? String(query.server) : undefined
  const limit = Math.min(Number(query.limit) || 20, 50)

  const where: any = { isRecruiting: true }
  if (playstyle) where.playstyle = playstyle
  if (server && server !== 'Any') where.server = server
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { tag: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const guilds = await prisma.guild.findMany({
    where,
    take: limit,
    orderBy: { memberCount: 'desc' },
    include: {
      leader: { select: { sqwUsername: true, ingameUsername: true } },
    },
  })

  return guilds.map(g => ({
    id: g.id,
    name: g.name,
    tag: g.tag,
    description: g.description,
    leader: g.leader.sqwUsername,
    leaderIngame: g.leader.ingameUsername,
    minLevel: g.minLevel,
    playstyle: g.playstyle,
    server: g.server,
    memberCount: g.memberCount,
    isRecruiting: g.isRecruiting,
    createdAt: g.createdAt.toISOString(),
  }))
})