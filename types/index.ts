import type { Timestamp } from 'firebase/firestore'
export type { User as FirebaseUser } from 'firebase/auth'

/**
 * 候補日の最大件数
 */
export const MAX_CANDIDATE_COUNT = 5

/**
 * 予定タグの種類（デフォルト）
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
 * 全デフォルトタグのリスト
 */
export const ALL_TAGS: ScheduleTag[] = ['meeting', 'shooting', 'document']

/**
 * 文字列がデフォルトタグかどうかを判定する
 * @param tag - 判定する文字列
 */
export const isDefaultTag = (tag: string): tag is ScheduleTag =>
  ALL_TAGS.includes(tag as ScheduleTag)

/**
 * ユーザー独自のタグ
 */
export interface CustomTag {
  id: string
  label: string
  /** 工数（1日の合計がlimitを超えると過密日） */
  workload: number
}

/**
 * デフォルトタグの工数設定
 */
export type DefaultTagWorkloads = Record<ScheduleTag, number>

/**
 * 過密日判定の設定
 */
export interface CongestionSettings {
  /** 1日の予定数チェックを有効にする */
  enableScheduleCountCheck: boolean
  /** 1日の最大予定数（これ以上で過密日） */
  maxSchedulesPerDay: number
  /** タグ工数チェックを有効にする */
  enableTagWorkloadCheck: boolean
  /** 1日の工数上限（これを超えると過密日） */
  tagWorkloadLimit: number
  /** デフォルトタグの工数 */
  defaultTagWorkloads: DefaultTagWorkloads
  /** ユーザー独自のタグ */
  customTags: CustomTag[]
  /** 最終更新日時 */
  updatedAt?: Timestamp
}

/**
 * デフォルトのタグ工数
 */
export const DEFAULT_TAG_WORKLOADS: DefaultTagWorkloads = {
  meeting: 3,
  shooting: 5,
  document: 2,
}

/**
 * 過密日設定のデフォルト値
 */
export const DEFAULT_CONGESTION_SETTINGS: Omit<CongestionSettings, 'updatedAt'> = {
  enableScheduleCountCheck: true,
  maxSchedulesPerDay: 3,
  enableTagWorkloadCheck: true,
  tagWorkloadLimit: 10,
  defaultTagWorkloads: DEFAULT_TAG_WORKLOADS,
  customTags: [],
}

/**
 * 案件（プロジェクト）の型定義
 */
export interface Project {
  id: string
  /** 案件名 */
  name: string
  /** オーナーのユーザーID */
  ownerId: string
  /** 表示順序（カレンダー列の並び順） */
  order?: number
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
  /** タグのリスト（デフォルトタグIDまたはカスタムタグID） */
  tags: string[]
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
  tags: string[]
}
