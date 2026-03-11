import { EntitySchema } from 'typeorm';
import { QuestHero } from './QuestHero';

export type UrgencyLevel = 'low' | 'medium' | 'high';
export type QuestStatus = 'open' | 'resolved';

export interface SosQuest {
  id: string;               // UUID
  ticketId: string;         // unique ticket
  username: string;
  map: string;
  roomId: string;
  issue?: string | null;
  urgency: UrgencyLevel;
  isBoss: boolean;
  status: QuestStatus;
  helpers?: string | null;
  heroes?: QuestHero[];
  createdAt: Date;
  updatedAt: Date;
}

export const SosQuestSchema = new EntitySchema<SosQuest>({
  name: 'SosQuest',
  tableName: 'sos_quests',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    username: { type: 'varchar' },
    map: { type: 'varchar' },
    roomId: { type: 'varchar' },
    issue: { type: 'text', nullable: true },
    urgency: { type: 'varchar', default: 'medium' },
    isBoss: { type: 'boolean', default: false },
    status: { type: 'varchar', default: 'open' },
    helpers: { type: 'text', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    heroes: {
      type: 'one-to-many',
      target: 'QuestHero',
      inverseSide: 'quest',
      cascade: true,
      eager: true,
    },
  },
});