import type { Timestamp } from 'firebase/firestore'
export type { User as FirebaseUser } from 'firebase/auth'

/**
 * 候補日の最大件数
 */
export const MAX_CANDIDATE_COUNT = 5

/**
 * 予定タグの種類
 */
export type ScheduleTag = 'meeting' | 'shooting' | 'document'

/**
 * タグの表示ラベル
 */
export const TAG_LABELS: Record<ScheduleTag, string> = {
  meeting: '打ち合わせ',
  shooting: '撮影',
  document: '資料作成',
}

/**
 * 全タグのリスト
 */
export const ALL_TAGS: ScheduleTag[] = ['meeting', 'shooting', 'document']

/**
 * 案件（プロジェクト）の型定義
 */
export interface Project {
  id: string
  /** 案件名 */
  name: string
  /** オーナーのユーザーID */
  ownerId: string
  /** 作成日時 */
  createdAt?: Timestamp
}

/**
 * 予定のステータス
 */
export type ScheduleStatus = 'candidate' | 'confirmed'

/**
 * 予定の型定義
 */
export interface Schedule {
  id: string
  /** 紐付く案件ID */
  projectId: string
  /** 予定タイトル */
  title: string
  /** ステータス: candidate（候補）| confirmed（確定） */
  status: ScheduleStatus
  /** 確定日時（確定済みの場合のみ設定） */
  confirmedDate: Timestamp | null
  /** 候補日のリスト（最大5件） */
  candidateDates: readonly Timestamp[]
  /** タグのリスト */
  tags: ScheduleTag[]
  /** 作成日時 */
  createdAt?: Timestamp
}

/**
 * Firestoreに保存するProject（idを除く）
 */
export type ProjectInput = Omit<Project, 'id'>

/**
 * Firestoreに保存するSchedule（idを除く）
 */
export type ScheduleInput = Omit<Schedule, 'id'>

/**
 * UI フォーム用のスケジュールデータ（Firebase Timestamp を使わない）
 */
export interface ScheduleFormData {
  title: string
  projectId: string
  status: ScheduleStatus
  confirmedDate: Date | null
  candidateDates: Date[]
  tags: ScheduleTag[]
}
