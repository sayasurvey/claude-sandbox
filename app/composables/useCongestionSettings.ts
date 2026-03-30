import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore'
import type { CongestionSettings } from '../../types'
import { DEFAULT_CONGESTION_SETTINGS } from '../../types'

/**
 * 過密日判定設定の取得・保存を管理するコンポーザブル
 *
 * @returns settings - 過密日設定（リアクティブ）
 * @returns isLoading - データ取得中フラグ
 * @returns error - エラーメッセージ
 * @returns saveSettings - 設定を保存する
 */
export const useCongestionSettings = () => {
  const { $firestore } = useNuxtApp()
  const firestore = $firestore as Firestore
  const { currentUser } = useAuth()

  const settings = ref<Omit<CongestionSettings, 'updatedAt'>>({
    ...DEFAULT_CONGESTION_SETTINGS,
    defaultTagWorkloads: { ...DEFAULT_CONGESTION_SETTINGS.defaultTagWorkloads },
    customTags: [],
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Firestore から設定を取得する（未設定の場合はデフォルト値を使用）
   */
  const fetchSettings = async (): Promise<void> => {
    if (!currentUser.value) return

    isLoading.value = true
    error.value = null

    try {
      const docRef = doc(firestore, 'congestion_settings', currentUser.value.uid)
      const snap = await getDoc(docRef)

      if (snap.exists()) {
        const data = snap.data() as CongestionSettings
        settings.value = {
          enableScheduleCountCheck: data.enableScheduleCountCheck ?? DEFAULT_CONGESTION_SETTINGS.enableScheduleCountCheck,
          maxSchedulesPerDay: data.maxSchedulesPerDay ?? DEFAULT_CONGESTION_SETTINGS.maxSchedulesPerDay,
          enableTagWorkloadCheck: data.enableTagWorkloadCheck ?? DEFAULT_CONGESTION_SETTINGS.enableTagWorkloadCheck,
          tagWorkloadLimit: data.tagWorkloadLimit ?? DEFAULT_CONGESTION_SETTINGS.tagWorkloadLimit,
          defaultTagWorkloads: {
            ...DEFAULT_CONGESTION_SETTINGS.defaultTagWorkloads,
            ...(data.defaultTagWorkloads ?? {}),
          },
          customTags: data.customTags ?? [],
        }
      }
    } catch (e) {
      console.error('過密日設定取得エラー:', e)
      error.value = '設定の取得に失敗しました'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 設定を Firestore に保存する
   * @param newSettings - 保存する設定
   */
  const saveSettings = async (newSettings: Omit<CongestionSettings, 'updatedAt'>): Promise<void> => {
    if (!currentUser.value) throw new Error('未認証')

    const docRef = doc(firestore, 'congestion_settings', currentUser.value.uid)
    await setDoc(docRef, { ...newSettings, updatedAt: serverTimestamp() })

    settings.value = { ...newSettings }
  }

  watch(
    currentUser,
    (user) => {
      if (user) fetchSettings()
    },
    { immediate: true },
  )

  return {
    settings: computed(() => settings.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    saveSettings,
  }
}
