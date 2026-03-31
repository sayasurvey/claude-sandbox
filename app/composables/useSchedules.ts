import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore'
import type { Schedule, ScheduleInput } from '../../types'
import { MAX_CANDIDATE_COUNT } from '../../types'
import { toDateKey } from '../utils/dateHelper'

/**
 * スケジュールの CRUD 操作を管理するコンポーザブル
 *
 * @returns schedules - スケジュールリスト
 * @returns isLoading - データ取得中フラグ
 * @returns error - エラーメッセージ
 * @returns fetchSchedules - スケジュール一覧を取得
 * @returns addSchedule - スケジュールを追加
 * @returns updateSchedule - スケジュールを更新
 * @returns deleteSchedule - スケジュールを削除
 * @returns confirmSchedule - 候補日から確定日に変更（同日を持つ他スケジュールの候補日も削除）
 */
export const useSchedules = () => {
  const { $firestore } = useNuxtApp()
  const firestore = $firestore as Firestore
  const { currentUser } = useAuth()

  const schedules = ref<Schedule[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 現在ユーザーの全スケジュールを取得する
   */
  const fetchSchedules = async (): Promise<void> => {
    if (!currentUser.value) return

    isLoading.value = true
    error.value = null

    try {
      // ユーザーの案件IDリストを取得
      const projectsSnapshot = await getDocs(
        query(
          collection(firestore, 'projects'),
          where('ownerId', '==', currentUser.value.uid),
        ),
      )
      const projectIds = projectsSnapshot.docs.map((d) => d.id)

      if (projectIds.length === 0) {
        schedules.value = []
        return
      }

      // Firestore の 'in' 演算子は最大10件のため、チャンク処理
      const allSchedules: Schedule[] = []
      for (let i = 0; i < projectIds.length; i += 10) {
        const chunk = projectIds.slice(i, i + 10)
        const snapshot = await getDocs(
          query(collection(firestore, 'schedules'), where('projectId', 'in', chunk)),
        )
        for (const d of snapshot.docs) {
          const data = d.data() as Omit<Schedule, 'id'>
          allSchedules.push({
            id: d.id,
            ...data,
            candidateDates: data.candidateDates ?? [],
            tags: data.tags ?? [],
          })
        }
      }

      schedules.value = allSchedules
    } catch (e) {
      console.error('スケジュール取得エラー:', e)
      error.value = 'スケジュールの取得に失敗しました'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * スケジュールを追加する
   * @param input - スケジュールデータ（id を除く）
   */
  const addSchedule = async (input: ScheduleInput): Promise<void> => {
    if (!currentUser.value) throw new Error('未認証')
    if (input.candidateDates.length > MAX_CANDIDATE_COUNT) {
      throw new Error(`候補日は最大${MAX_CANDIDATE_COUNT}件までです`)
    }

    const docRef = await addDoc(collection(firestore, 'schedules'), {
      ...input,
      candidateDates: [...input.candidateDates],
      createdAt: serverTimestamp(),
    })

    schedules.value.push({ id: docRef.id, ...input })
  }

  /**
   * スケジュールを更新する
   * @param id - スケジュール ID
   * @param input - 更新するフィールド
   */
  const updateSchedule = async (id: string, input: Partial<ScheduleInput>): Promise<void> => {
    const updateData = input.candidateDates
      ? { ...input, candidateDates: [...input.candidateDates] }
      : input

    await updateDoc(doc(firestore, 'schedules', id), updateData)

    const index = schedules.value.findIndex((s) => s.id === id)
    if (index !== -1) {
      schedules.value[index] = { ...schedules.value[index]!, ...input }
    }
  }

  /**
   * スケジュールを削除する
   * @param id - スケジュール ID
   */
  const deleteSchedule = async (id: string): Promise<void> => {
    await deleteDoc(doc(firestore, 'schedules', id))
    schedules.value = schedules.value.filter((s) => s.id !== id)
  }

  /**
   * 候補から確定に変更する（同日を候補日に持つ他スケジュールからその日を削除）
   * @param id - 確定するスケジュール ID
   * @param input - 更新後のスケジュールデータ（status='confirmed'、confirmedDate 必須）
   */
  const confirmSchedule = async (id: string, input: ScheduleInput): Promise<void> => {
    if (!input.confirmedDate) throw new Error('確定日が未設定です')

    const confirmedDateKey = toDateKey(input.confirmedDate.toDate())
    const batch = writeBatch(firestore)

    // 対象スケジュールを確定状態に更新（candidateDates は空にする）
    batch.update(doc(firestore, 'schedules', id), { ...input, candidateDates: [] })

    // 同じ日を候補に持つ他スケジュールから確定日を削除
    for (const s of schedules.value) {
      if (s.id === id) continue
      const newDates = s.candidateDates.filter(
        (d) => toDateKey(d.toDate()) !== confirmedDateKey,
      )
      if (newDates.length < s.candidateDates.length) {
        batch.update(doc(firestore, 'schedules', s.id), { candidateDates: [...newDates] })
      }
    }

    await batch.commit()

    // ローカル状態を更新
    schedules.value = schedules.value.map((s) => {
      if (s.id === id) return { ...s, ...input, candidateDates: [] }
      const newDates = s.candidateDates.filter(
        (d) => toDateKey(d.toDate()) !== confirmedDateKey,
      )
      return newDates.length < s.candidateDates.length ? { ...s, candidateDates: newDates } : s
    })
  }

  /**
   * 指定されたタグIDをすべてのスケジュールの tags 配列から削除する
   * @param tagIds - 削除するタグ ID の配列
   */
  const removeTagFromSchedules = async (tagIds: string[]): Promise<void> => {
    if (tagIds.length === 0) return

    const batch = writeBatch(firestore)
    let hasUpdates = false

    for (const schedule of schedules.value) {
      const newTags = schedule.tags.filter((t) => !tagIds.includes(t))
      if (newTags.length < schedule.tags.length) {
        batch.update(doc(firestore, 'schedules', schedule.id), { tags: newTags })
        hasUpdates = true
      }
    }

    if (hasUpdates) await batch.commit()

    schedules.value = schedules.value.map((s) => ({
      ...s,
      tags: s.tags.filter((t) => !tagIds.includes(t)),
    }))
  }

  watch(
    currentUser,
    (user) => {
      if (user) fetchSchedules()
    },
    { immediate: true },
  )

  return {
    schedules: computed(() => schedules.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    confirmSchedule,
    removeTagFromSchedules,
  }
}
