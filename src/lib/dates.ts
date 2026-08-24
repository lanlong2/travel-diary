export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Parse a Postgres DATE as a local calendar date instead of UTC midnight. */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

export function formatDateOnly(value: string, options: Intl.DateTimeFormatOptions): string {
  return parseDateOnly(value).toLocaleDateString('zh-CN', options)
}

export function getRecordTimestamp(
  recordDate: string | null | undefined,
  createdAt: string,
): number {
  return recordDate ? parseDateOnly(recordDate).getTime() : new Date(createdAt).getTime()
}

export function formatRecordDate(
  recordDate: string | null | undefined,
  createdAt: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return recordDate
    ? formatDateOnly(recordDate, options)
    : new Date(createdAt).toLocaleDateString('zh-CN', options)
}

export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return false
  return parseDateOnly(endDate).getTime() >= parseDateOnly(startDate).getTime()
}
