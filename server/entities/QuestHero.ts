// server/db/entities/QuestHero.schema.ts
import { EntitySchema } from 'typeorm';
import { SosQuest } from './SosQuest';

export type QuestHero = {
  id: string;               // UUID
  username: string;         // username of the hero
  questId: string;          // foreign key to SosQuest
  quest?: SosQuest;         // optional relation
  committedAt: Date;        // timestamp when committed
};

export const QuestHeroSchema = new EntitySchema<QuestHero>({
  name: 'QuestHero',
  tableName: 'quest_heroes',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    username: {
      type: 'varchar',
      nullable: false,
    },
    questId: {
      type: 'uuid',
      nullable: false,
    },
    committedAt: {
      type: 'timestamp',
      createDate: true,
    },
  },
  relations: {
    quest: {
      type: 'many-to-one',
      target: 'SosQuest',        // links to the SosQuest entity
      joinColumn: { name: 'quest_id' },
      inverseSide: 'heroes',     // matches SosQuest.heroes
      onDelete: 'CASCADE',
      nullable: false,
      eager: false,              // optional, load manually
    },
  },
});