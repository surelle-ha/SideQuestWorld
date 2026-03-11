import type { QuestDto } from '../../types/quest'

/** Generate a short human-readable ticket ID */
export function generateTicketId(): string {
  return 'SQW-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

/** Serialize a SosQuest prisma result into the API response shape */
export function serializeQuest(quest: any): QuestDto {
  return {
    id:        quest.id,
    ticketId:  quest.ticketId,
    username:  quest.username,
    server:    quest.server ?? '',
    map:       quest.map,
    roomId:    quest.roomId,
    issue:     quest.issue ?? null,
    urgency:   quest.urgency,
    isBoss:    quest.isBoss,
    status:    quest.status,
    helpers:   quest.helpers ? quest.helpers.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    heroes:    (quest.heroes ?? []).map((h: any) => ({
      id:          h.id,
      username:    h.username,
      committedAt: h.committedAt.toISOString(),
    })),
    createdAt: quest.createdAt.toISOString(),
    updatedAt: quest.updatedAt.toISOString(),
  }
}

/** Validate required string field */
export function requireField(value: unknown, name: string): string {
  if (!value || typeof value !== 'string' || !value.trim()) {
    throw createError({ statusCode: 400, message: `${name} is required` })
  }
  return value.trim()
}