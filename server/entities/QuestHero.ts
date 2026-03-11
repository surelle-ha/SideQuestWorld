// server/entities/QuestHero.ts
// Plain types only — Prisma handles the schema via prisma/schema.prisma

export type QuestHero = {
  id:          string
  username:    string
  questId:     string
  committedAt: Date
}