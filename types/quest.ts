export interface HeroDto {
  id: string
  username: string
  committedAt: string
}

export interface QuestDto {
  id: string
  ticketId: string
  username: string
  map: string
  roomId: string
  issue: string | null
  urgency: 'low' | 'medium' | 'high'
  isBoss: boolean
  status: 'open' | 'resolved'
  helpers: string[]       // array parsed from stored comma string
  heroes: HeroDto[]
  createdAt: string
  updatedAt: string
}

export interface CreateQuestBody {
  username: string
  map: string
  roomId: string
  issue?: string
  urgency?: 'low' | 'medium' | 'high'
  isBoss?: boolean
}

export interface CompleteQuestBody {
  helpers: string[]       // usernames of players who helped
}

export interface CommitHeroBody {
  username: string
}
