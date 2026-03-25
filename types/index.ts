import type { Timestamp } from 'firebase/firestore'

/**
 * 候補日の最大件数
 */
export const MAX_CANDIDATE_COUNT = 5

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
