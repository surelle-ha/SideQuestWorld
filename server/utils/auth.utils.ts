// server/utils/auth.utils.ts
import { createHash, randomBytes } from 'crypto'

/** Hash a password with SHA-256 + salt (for production use bcrypt) */
export function hashPassword(password: string): string {
  const salt = 'sqw_salt_2025' // In prod: use bcrypt with random salt per user
  return createHash('sha256').update(salt + password).digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function generateSessionToken(): string {
  return randomBytes(48).toString('hex')
}

export function getSessionExpiry(): Date {
  const d = new Date()
  d.setDate(d.getDate() + 30) // 30-day sessions
  return d
}

/** Extract token from Authorization header or sqw_session cookie */
export function extractToken(event: any): string | null {
  // Check cookie
  const cookies = parseCookies(event)
  if (cookies.sqw_session) return cookies.sqw_session
  // Check Authorization header
  const auth = getHeader(event, 'authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

/** Get the authenticated user from a request, returns null if not authenticated */
export async function getAuthUser(event: any) {
  const token = extractToken(event)
  if (!token) return null

  const prisma = (await import('~~/server/db/prisma')).default
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) return null
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  return session.user
}