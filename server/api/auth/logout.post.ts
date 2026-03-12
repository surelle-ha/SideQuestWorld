// server/api/auth/logout.post.ts
import prisma from '~~/server/db/prisma'
import { extractToken } from '~~/server/utils/auth.utils'
import { deleteCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const token = extractToken(event)
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {})
  }
  deleteCookie(event, 'sqw_session', { path: '/' })
  return { success: true }
})