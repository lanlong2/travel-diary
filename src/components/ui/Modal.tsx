import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-cream rounded-3xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-auto animate-in">
        <div className="flex items-center justify-between p-5 border-b border-warm-200">
          {title && <h2 className="text-lg font-semibold text-warm-900">{title}</h2>}
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-warm-100 transition-colors">
            <X className="w-5 h-5 text-warm-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
