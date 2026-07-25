import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = 'success', isVisible, onClose, duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible && !show) return null

  const isSuccess = type === 'success'

  return (
    <div
      className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-[14px] glass-popup border-l-2 transition-all duration-400 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        borderLeftColor: isSuccess ? 'oklch(68% 0.17 40)' : 'oklch(60% 0.18 25)',
        boxShadow: `0 16px 48px oklch(15% 0.02 40 / 0.5), 0 0 0 1px oklch(80% 0.14 60 / 0.2)`,
      }}
    >
      {isSuccess
        ? <CheckCircle className="w-5 h-5 text-amber flex-shrink-0" />
        : <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />}
      <span className={`text-[13px] font-medium tracking-[0.02em] ${isSuccess ? 'text-dusk-50' : 'text-red-200'}`}>
        {message}
      </span>
      <button onClick={onClose} className="ml-1 p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 active:scale-90 duration-200" aria-label="关闭">
        <X className="w-3.5 h-3.5 text-dusk-100/60" />
      </button>
    </div>
  )
}
