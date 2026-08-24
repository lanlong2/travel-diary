import { describe, expect, it } from 'vitest'
import {
  formatRecordDate,
  getLocalDateString,
  getRecordTimestamp,
  isValidDateRange,
  parseDateOnly,
} from '../lib/dates'

describe('date helpers', () => {
  it('keeps a date-only value on the same local calendar day', () => {
    const parsed = parseDateOnly('2026-01-02')

    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(0)
    expect(parsed.getDate()).toBe(2)
  })

  it('formats local dates without using UTC conversion', () => {
    expect(getLocalDateString(new Date(2026, 6, 9))).toBe('2026-07-09')
    expect(
      formatRecordDate('2026-07-09', '2026-01-01T00:00:00.000Z', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    ).toContain('09')
  })

  it('sorts custom record dates before creation timestamps', () => {
    const customDate = getRecordTimestamp('2026-07-09', '2025-01-01T00:00:00.000Z')
    const fallbackDate = getRecordTimestamp(null, '2026-07-08T00:00:00.000Z')

    expect(customDate).toBeGreaterThan(fallbackDate)
  })

  it('rejects trips whose end date is earlier than the start date', () => {
    expect(isValidDateRange('2026-07-09', '2026-07-09')).toBe(true)
    expect(isValidDateRange('2026-07-10', '2026-07-09')).toBe(false)
    expect(isValidDateRange('', '2026-07-09')).toBe(false)
  })
})
