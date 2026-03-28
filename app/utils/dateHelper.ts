const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

/**
 * Date を YYYY-MM-DD 形式の文字列（input[type=date] 用）に変換する
 * @param date - 変換する Date オブジェクト
 */
export const toDateInputString = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * YYYY-MM-DD 文字列を Date オブジェクトに変換する（ローカルタイム）
 * @param str - YYYY-MM-DD 形式の文字列
 */
export const fromDateInputString = (str: string): Date => {
  const parts = str.split('-').map(Number)
  return new Date(parts[0]!, parts[1]! - 1, parts[2]!)
}

/**
 * Date をカレンダーキー用の文字列（YYYY-MM-DD）に変換する
 * @param date - 変換する Date オブジェクト
 */
export const toDateKey = (date: Date): string => toDateInputString(date)

/**
 * 指定した年月の全日付リストを返す
 * @param year - 年
 * @param month - 月（0-indexed）
 */
export const getDatesInMonth = (year: number, month: number): Date[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
}

/**
 * Date を「M/D(曜)」形式に変換する
 * @param date - 変換する Date オブジェクト
 */
export const formatDateLabel = (date: Date): string => {
  const m = date.getMonth() + 1
  const d = date.getDate()
  const w = WEEKDAY_LABELS[date.getDay()]
  return `${m}/${d}(${w})`
}
