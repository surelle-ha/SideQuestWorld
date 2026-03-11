// server/db/data-source.ts
import { DataSource } from 'typeorm'
import { SosQuestSchema } from '../entities/SosQuest'
import { QuestHeroSchema } from '../entities/QuestHero'
import pg from 'pg'; 

// Singleton DataSource — reused across requests
let dataSource: DataSource | null = null

export async function getDataSource(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) return dataSource

  const config = useRuntimeConfig()

  dataSource = new DataSource({
    type: 'postgres',
    url: config.databaseUrl, // DATABASE_URL in .env
    entities: [SosQuestSchema, QuestHeroSchema],
    synchronize: config.public.nodeEnv !== 'production', // dev only
    logging: config.public.nodeEnv === 'development',
    ssl: config.public.nodeEnv === 'production'
      ? { rejectUnauthorized: false } // Railway / Render
      : false,
  })

  await dataSource.initialize()
  console.log('DataSource initialized!')
  return dataSource
}