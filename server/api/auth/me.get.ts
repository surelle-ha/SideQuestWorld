// server/api/auth/me.get.ts
import { getAuthUser } from '~~/server/utils/auth.utils'

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Not authenticated' })

  return {
    id: user.id,
    sqwUsername: user.sqwUsername,
    ingameUsername: user.ingameUsername,
    email: user.email,
    heroPoints: user.heroPoints,
  }
})