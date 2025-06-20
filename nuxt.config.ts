// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
  ],
  devtools: { enabled: true },
  runtimeConfig: {
    supabaseDbPassowrd: process.env.SUPABASE_DB_PASSWORD,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },
  compatibilityDate: '2024-11-01',
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
