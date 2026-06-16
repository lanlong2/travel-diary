import { useState, useEffect, useMemo } from 'react'

// 崔浩与李沐桐在一起的日子
export const TOGETHER_START_DATE = new Date(2025, 10, 8) // 2025-11-08

function formatDate(date: Date): string {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

export function useDaysCount() {
  const [days, setDays] = useState(0)

  useEffect(() => {
    const calc = () => {
      const now = new Date()
      const diff = now.getTime() - TOGETHER_START_DATE.getTime()
      setDays(Math.floor(diff / (1000 * 60 * 60 * 24)) + 1) // +1: 第一天也算
    }
    calc()
    const timer = setInterval(calc, 60 * 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  const startDateStr = useMemo(() => formatDate(TOGETHER_START_DATE), [])

  return { days, startDateStr }
}
