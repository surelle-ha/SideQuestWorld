// server/entities/SosQuest.ts
// Plain types only — Prisma handles the schema via prisma/schema.prisma

export type UrgencyLevel = 'low' | 'medium' | 'high'
export type QuestStatus  = 'open' | 'resolved'

export interface SosQuest {
  id:        string
  ticketId:  string
  username:  string
  map:       string
  roomId:    string
  issue:     string | null
  urgency:   UrgencyLevel
  isBoss:    boolean
  status:    QuestStatus
  helpers:   string | null
  heroes?:   QuestHero[]
  createdAt: Date
  updatedAt: Date
}

import type { QuestHero } from './QuestHero'