import { useState, useCallback, useRef } from 'react'

export interface RippleData {
  id: number
  x: number
  y: number
}

export function useRipple() {
  const [ripples, setRipples] = useState<RippleData[]>([])
  const counterRef = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = counterRef.current++
    setRipples((prev) => [...prev, { id, x, y }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 600)
  }, [])

  return { ripples, onPointerDown }
}
