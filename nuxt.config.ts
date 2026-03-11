// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: process.env.DB_PORT || '5432',
    dbUser: process.env.DB_USER || 'postgres',
    dbPass: process.env.DB_PASS || '',
    dbName: process.env.DB_NAME || 'sidequestworld',
    public: {
      nodeEnv: process.env.NODE_ENV || 'development',
    },
  },

  nitro: {
    externals: {
      external: ['@prisma/client', '.prisma/client', '.prisma/client/default'],
    },
  },

  modules: ['@nuxtjs/seo'],
})