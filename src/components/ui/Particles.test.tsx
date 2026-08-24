import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Particles } from './Particles'

function canvasContext() {
  const gradient = { addColorStop: vi.fn() }
  return {
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    fill: vi.fn(),
    beginPath: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    clearRect: vi.fn(),
    createRadialGradient: vi.fn(() => gradient),
    globalAlpha: 1,
    fillStyle: '',
    globalCompositeOperation: 'source-over',
    gradient,
  }
}

describe('Particles', () => {
  let frames: FrameRequestCallback[]
  let context: ReturnType<typeof canvasContext>

  beforeEach(() => {
    frames = []
    context = canvasContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never)
    vi.stubGlobal(
      'Path2D',
      class {
        constructor(_path: string) {}
      },
    )
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frames.push(callback)
        return frames.length
      }),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it.each([0.1, 0.5, 0.9])('animates each particle shape for random value %s', (randomValue) => {
    vi.spyOn(Math, 'random').mockReturnValue(randomValue)
    const { unmount, container } = render(<Particles />)
    const canvas = container.querySelector('canvas')!
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
    expect(context.setTransform).toHaveBeenCalled()

    act(() => frames.shift()?.(6001))
    expect(context.clearRect).toHaveBeenCalled()
    expect(context.createRadialGradient).toHaveBeenCalled()
    expect(context.fill).toHaveBeenCalled()

    act(() => window.dispatchEvent(new Event('resize')))
    act(() => frames.shift()?.(6010))
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    unmount()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  it('hides the canvas when reduced motion is requested and restores it on cleanup', () => {
    vi.mocked(window.matchMedia).mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as never,
    )
    const { container, unmount } = render(<Particles />)
    const canvas = container.querySelector('canvas')!
    expect(canvas.hidden).toBe(true)
    unmount()
    expect(canvas.hidden).toBe(false)
  })

  it('gracefully stops when a 2D context is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    expect(() => render(<Particles />)).not.toThrow()
    expect(requestAnimationFrame).not.toHaveBeenCalled()
  })
})
