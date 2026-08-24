import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Toast({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  const [show, setShow] = useState(false)
  const onCloseRef = useRef(onClose)
  const closeTimerRef = useRef<number | null>(null)

  onCloseRef.current = onClose

  const beginClose = useCallback(() => {
    setShow(false)
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => onCloseRef.current(), 180)
  }, [])

  useEffect(() => {
    if (!isVisible) {
      setShow(false)
      return
    }

    const enterFrame = window.requestAnimationFrame(() => setShow(true))
    const hideTimer = window.setTimeout(beginClose, Math.max(0, duration))

    return () => {
      window.cancelAnimationFrame(enterFrame)
      window.clearTimeout(hideTimer)
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }
  }, [beginClose, duration, isVisible])

  if (!isVisible && !show) return null

  const isSuccess = type === 'success'

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] z-[70] flex justify-center px-4 md:bottom-6"
      style={{
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
      }}
    >
      <div
        role={isSuccess ? 'status' : 'alert'}
        aria-live={isSuccess ? 'polite' : 'assertive'}
        aria-atomic="true"
        className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border bg-dusk-800/95 py-2.5 pl-4 pr-2 shadow-[0_16px_42px_oklch(8%_0.01_50_/_0.48)] backdrop-blur-xl transition-[opacity,transform] duration-200 ${
          show ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        } ${isSuccess ? 'border-amber/25' : 'border-red-400/35'}`}
      >
        {isSuccess ? (
          <CheckCircle aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-amber" />
        ) : (
          <AlertCircle aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-red-300" />
        )}
        <span
          className={`min-w-0 flex-1 text-sm font-medium leading-5 ${isSuccess ? 'text-dusk-50' : 'text-red-200'}`}
        >
          {message}
        </span>
        <button
          type="button"
          onClick={beginClose}
          className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-lg text-dusk-100/70 transition-colors hover:bg-white/[0.07] hover:text-dusk-50 active:scale-95"
          aria-label={'\u5173\u95ed\u63d0\u793a'}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
