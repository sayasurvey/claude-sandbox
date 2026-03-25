import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

/**
 * Firebase アプリ、Auth、Firestore のインスタンスをNuxtアプリに提供するプラグイン
 * クライアントサイドのみで実行される（.client.ts）
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // Firebase 設定オブジェクト
  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
    measurementId: config.public.firebaseMeasurementId,
  }

  // 多重初期化を防ぐ
  let app: FirebaseApp
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]!
  }

  const auth: Auth = getAuth(app)
  const firestore: Firestore = getFirestore(app)

  return {
    provide: {
      firebaseApp: app,
      auth,
      firestore,
    },
  }
})
