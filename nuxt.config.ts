// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
  ],

  // CSS設定 - Tailwind CSS v4
  css: ['~/assets/css/main.css'],

  // Vite設定 - Tailwind CSS v4 プラグイン
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Docker環境でのE2Eテスト用にホスト名「app」を許可
      allowedHosts: ['app'],
    },
  },

  // ランタイム設定（環境変数）
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
    tsConfig: {
      include: ['types/**/*'],
    },
  },

  app: {
    head: {
      title: 'スケジュール管理アプリ',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '案件ごとのスケジュール管理アプリ' },
      ],
    },
  },

  compatibilityDate: '2024-11-01',
})
