/**
 * useDaysCount hook 测试
 *
 * TOGETHER_START_DATE = 2025-11-08 (local time)
 * 返回 { days, startDateStr }
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDaysCount, TOGETHER_START_DATE } from '../hooks/useDaysCount'

function daysBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

function futureDate(offsetDays: number): Date {
  const d = new Date(TOGETHER_START_DATE)
  d.setDate(d.getDate() + offsetDays)
  return d
}

describe('useDaysCount', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns { days, startDateStr }', () => {
    vi.setSystemTime(futureDate(30))
    const { result } = renderHook(() => useDaysCount())
    expect(result.current).toHaveProperty('days')
    expect(result.current).toHaveProperty('startDateStr')
    expect(typeof result.current.days).toBe('number')
    expect(typeof result.current.startDateStr).toBe('string')
  })

  it('startDateStr is formatted in Chinese', () => {
    vi.setSystemTime(futureDate(30))
    const { result } = renderHook(() => useDaysCount())
    expect(result.current.startDateStr).toMatch(/\d{4} 年 \d{1,2} 月 \d{1,2} 日/)
  })

  it('days grows as time advances', () => {
    vi.setSystemTime(futureDate(10))
    const { result: r1, unmount } = renderHook(() => useDaysCount())
    const days1 = r1.current.days
    unmount()

    vi.setSystemTime(futureDate(20))
    const { result: r2 } = renderHook(() => useDaysCount())
    const days2 = r2.current.days

    expect(days2).toBeGreaterThan(days1)
  })

  it('returns positive days after start date', () => {
    vi.setSystemTime(futureDate(100))
    const { result } = renderHook(() => useDaysCount())
    expect(result.current.days).toBeGreaterThan(0)
  })

  it('recalculates days when timer fires (past midnight)', () => {
    // 设置在中午
    vi.setSystemTime(futureDate(50))
    // 手动调整为中午（加12小时让 next midnight 更近）
    const noon = futureDate(50)
    noon.setHours(12, 0, 0, 0)
    vi.setSystemTime(noon)

    const { result } = renderHook(() => useDaysCount())
    const daysBefore = result.current.days

    // 推进到第二天凌晨
    act(() => {
      vi.advanceTimersByTime(13 * 60 * 60 * 1000)
    })
    expect(result.current.days).toBeGreaterThan(daysBefore)
  })

  it('TOGETHER_START_DATE is exported and valid', () => {
    expect(TOGETHER_START_DATE).toBeInstanceOf(Date)
    expect(TOGETHER_START_DATE.getFullYear()).toBe(2025)
    // month is 0-indexed, so 10 = November
    expect(TOGETHER_START_DATE.getMonth()).toBe(10)
    expect(TOGETHER_START_DATE.getDate()).toBe(8)
  })
})
