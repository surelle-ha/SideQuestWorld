// server/api/auth/register.post.ts
import prisma from '~~/server/db/prisma'
import { hashPassword, generateSessionToken, getSessionExpiry } from '~~/server/utils/auth.utils'
import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { sqwUsername, email, ingameUsername, password } = body ?? {}

  // Validate required fields
  if (!sqwUsername?.trim()) throw createError({ statusCode: 400, message: 'Side Quest Username is required' })
  if (!email?.trim()) throw createError({ statusCode: 400, message: 'Email is required' })
  if (!ingameUsername?.trim()) throw createError({ statusCode: 400, message: 'In-Game Username is required' })
  if (!password || password.length < 8) throw createError({ statusCode: 400, message: 'Password must be at least 8 characters' })

  // Validate email format
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRx.test(email)) throw createError({ statusCode: 400, message: 'Invalid email address' })

  // Validate username (alphanumeric + underscore, 3-20 chars)
  const usernameRx = /^[a-zA-Z0-9_]{3,20}$/
  if (!usernameRx.test(sqwUsername)) {
    throw createError({ statusCode: 400, message: 'Side Quest Username must be 3-20 characters, letters/numbers/underscores only' })
  }

  // Check uniqueness
  const existing = await prisma.user.findFirst({
    where: { OR: [{ sqwUsername: sqwUsername.trim() }, { email: email.trim().toLowerCase() }] },
  })
  if (existing) {
    if (existing.sqwUsername.toLowerCase() === sqwUsername.trim().toLowerCase()) {
      throw createError({ statusCode: 409, message: 'That Side Quest Username is already taken' })
    }
    throw createError({ statusCode: 409, message: 'That email is already registered' })
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      sqwUsername: sqwUsername.trim(),
      email: email.trim().toLowerCase(),
      ingameUsername: ingameUsername.trim(),
      passwordHash: hashPassword(password),
    },
  })

  // Create session
  const token = generateSessionToken()
  const session = await prisma.session.create({
    data: { userId: user.id, token, expiresAt: getSessionExpiry() },
  })

  // Set cookie
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