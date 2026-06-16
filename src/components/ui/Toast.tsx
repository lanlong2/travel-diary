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
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg shadow-warm-900/10 backdrop-blur-xl border transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${
        isSuccess
          ? 'bg-warm-50/95 text-warm-800 border-warm-300/60'
          : 'bg-red-50/95 text-red-700 border-red-200/60'
      }`}
    >
      {isSuccess
        ? <CheckCircle className="w-5 h-5 text-warm-500 flex-shrink-0" />
        : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      }
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-1 p-1 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
