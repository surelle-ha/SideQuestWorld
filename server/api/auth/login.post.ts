// server/api/auth/login.post.ts
import prisma from '~~/server/db/prisma'
import { verifyPassword, generateSessionToken, getSessionExpiry } from '~~/server/utils/auth.utils'
import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { sqwUsername, password } = body ?? {}

  if (!sqwUsername?.trim()) throw createError({ statusCode: 400, message: 'Side Quest Username is required' })
  if (!password) throw createError({ statusCode: 400, message: 'Password is required' })

  const user = await prisma.user.findUnique({
    where: { sqwUsername: sqwUsername.trim() },
  })

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, message: 'Invalid username or password' })
  }

  // Create session
  const token = generateSessionToken()
  const session = await prisma.session.create({
    data: { userId: user.id, token, expiresAt: getSessionExpiry() },
  })

  setCookie(event, 'sqw_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    expires: session.expiresAt,
  })

  return {
    user: {
      id: user.id,
      sqwUsername: user.sqwUsername,
      ingameUsername: user.ingameUsername,
      email: user.email,
      heroPoints: user.heroPoints,
    },
  }
})