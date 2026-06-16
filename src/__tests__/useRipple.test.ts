// src/__tests__/useRipple.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRipple } from '../hooks/useRipple'

describe('useRipple', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('返回 ripples 和 onPointerDown', () => {
    const { result } = renderHook(() => useRipple())
    expect(result.current).toHaveProperty('ripples')
    expect(result.current).toHaveProperty('onPointerDown')
    expect(Array.isArray(result.current.ripples)).toBe(true)
    expect(result.current.ripples).toHaveLength(0)
    expect(typeof result.current.onPointerDown).toBe('function')
  })

  it('onPointerDown 后 ripples 数组包含新波纹', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useRipple())

    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({
          left: 100,
          top: 200,
          right: 300,
          bottom: 400,
          width: 200,
          height: 200,
        }),
      },
      clientX: 150,
      clientY: 250,
    } as unknown as React.PointerEvent<HTMLElement>

    act(() => {
      result.current.onPointerDown(mockEvent)
    })

    expect(result.current.ripples).toHaveLength(1)
    expect(result.current.ripples[0]).toMatchObject({
      x: 50,   // 150 - 100
      y: 50,   // 250 - 200
    })

    vi.useRealTimers()
  })

  it('波纹在 600ms 后自动移除', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useRipple())

    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({
          left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100,
        }),
      },
      clientX: 50,
      clientY: 50,
    } as unknown as React.PointerEvent<HTMLElement>

    act(() => {
      result.current.onPointerDown(mockEvent)
    })

    expect(result.current.ripples).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(650)
    })

    expect(result.current.ripples).toHaveLength(0)
    vi.useRealTimers()
  })

  it('多次点击产生多个波纹，各自独立消失', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useRipple())

    const makeEvent = (cx: number, cy: number) => ({
      currentTarget: {
        getBoundingClientRect: () => ({
          left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200,
        }),
      },
      clientX: cx,
      clientY: cy,
    } as unknown as React.PointerEvent<HTMLElement>)

    // 第一个波纹 at time 0
    act(() => { result.current.onPointerDown(makeEvent(10, 10)) })
    expect(result.current.ripples).toHaveLength(1)

    // 前进 200ms 后创建第二个波纹
    act(() => { vi.advanceTimersByTime(200) })
    act(() => { result.current.onPointerDown(makeEvent(50, 50)) })
    expect(result.current.ripples).toHaveLength(2)

    // 再前进 350ms — 第一个已过 550ms（未到600，还在），第二个已过 350ms
    act(() => { vi.advanceTimersByTime(350) })
    expect(result.current.ripples).toHaveLength(2)

    // 再前进 100ms — 第一个已过 650ms（消失），第二个已过 450ms（还在）
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current.ripples).toHaveLength(1)

    vi.useRealTimers()
  })
})
