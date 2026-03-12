// server/api/auth/update-profile.patch.ts
import prisma from '~~/server/db/prisma'
import { getAuthUser } from '~~/server/utils/auth.utils'

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Not authenticated' })

  const body = await readBody(event)
  const { ingameUsername } = body ?? {}

  if (!ingameUsername?.trim()) {
    throw createError({ statusCode: 400, message: 'In-game username is required' })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { ingameUsername: ingameUsername.trim() },
  })

  return {
    id: updated.id,
    sqwUsername: updated.sqwUsername,
    ingameUsername: updated.ingameUsername,
    email: updated.email,
    heroPoints: updated.heroPoints,
  }
})