import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore'
import type { Project } from '../../types'

/**
 * 案件の CRUD 操作を管理するコンポーザブル
 *
 * @returns projects - 案件リスト（order フィールド昇順）
 * @returns isLoading - データ取得中フラグ
 * @returns error - エラーメッセージ
 * @returns fetchProjects - 案件一覧を取得
 * @returns addProject - 案件を追加
 * @returns updateProject - 案件名を更新
 * @returns deleteProject - 案件を削除（紐づくスケジュールも削除）
 * @returns reorderProjects - 案件の表示順序を保存する
 */
export const useProjects = () => {
  const { $firestore } = useNuxtApp()
  const firestore = $firestore as Firestore
  const { currentUser } = useAuth()

  const projects = ref<Project[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 現在のユーザーの案件一覧を取得する
   */
  const fetchProjects = async (): Promise<void> => {
    if (!currentUser.value) return

    isLoading.value = true
    error.value = null

    try {
      const q = query(
        collection(firestore, 'projects'),
        where('ownerId', '==', currentUser.value.uid),
      )
      const snapshot = await getDocs(q)
      const raw = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Project, 'id'>),
      }))
      // order フィールドがない既存データも考慮してメモリ内でソート
      projects.value = raw.sort((a, b) => {
        const aOrder = a.order ?? Infinity
        const bOrder = b.order ?? Infinity
        return aOrder - bOrder
      })
    } catch (e) {
      console.error('案件取得エラー:', e)
      error.value = '案件の取得に失敗しました'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 案件を追加する
   * @param name - 案件名（最大30文字）
   */
  const addProject = async (name: string): Promise<void> => {
    if (!currentUser.value) throw new Error('未認証')

    const order = projects.value.length
    const docRef = await addDoc(collection(firestore, 'projects'), {
      name,
      ownerId: currentUser.value.uid,
      order,
      createdAt: serverTimestamp(),
    })

    projects.value.push({
      id: docRef.id,
      name,
      ownerId: currentUser.value.uid,
      order,
    })
  }

  /**
   * 案件名を更新する
   * @param id - 案件ID
   * @param name - 新しい案件名（最大30文字）
   */
  const updateProject = async (id: string, name: string): Promise<void> => {
    await updateDoc(doc(firestore, 'projects', id), { name })

    const index = projects.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index]!, name }
    }
  }

  /**
   * 案件を削除する（紐づくスケジュールも一括削除）
   * @param id - 案件ID
   */
  const deleteProject = async (id: string): Promise<void> => {
    const schedulesSnapshot = await getDocs(
      query(collection(firestore, 'schedules'), where('projectId', '==', id)),
    )

    // スケジュールと案件をバッチで原子的に削除
    const batch = writeBatch(firestore)
    for (const scheduleDoc of schedulesSnapshot.docs) {
      batch.delete(scheduleDoc.ref)
    }
    batch.delete(doc(firestore, 'projects', id))
    await batch.commit()

    projects.value = projects.value.filter((p) => p.id !== id)
  }

  /**
   * 案件の表示順序を更新する
   * @param orderedIds - 新しい順序に並んだ案件IDの配列
   */
  const reorderProjects = async (orderedIds: string[]): Promise<void> => {
    const batch = writeBatch(firestore)
    orderedIds.forEach((id, index) => {
      batch.update(doc(firestore, 'projects', id), { order: index })
    })
    await batch.commit()

    const map = new Map(projects.value.map((p) => [p.id, p]))
    projects.value = orderedIds.map((id, index) => ({
      ...map.get(id)!,
      order: index,
    }))
  }

  // onMounted では認証解決前にフェッチが実行されて空振りするため、
  // currentUser が確定したタイミングで確実にフェッチする
  watch(currentUser, (user) => {
    if (user) fetchProjects()
  }, { immediate: true })

  return {
    projects: computed(() => projects.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    reorderProjects,
  }
}
