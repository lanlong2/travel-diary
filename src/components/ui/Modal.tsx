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
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative glass-popup max-w-lg w-full max-h-[85vh] overflow-auto animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-dusk-300/30">
          {title && (
            <h2 className="text-lg font-semibold text-dusk-50 tracking-wide">{title}</h2>
          )}
          <button
            onClick={onClose}
            aria-label="关闭"
            className="p-2 rounded-xl hover:bg-white/10 transition-colors active:scale-90"
          >
            <X className="w-5 h-5 text-dusk-100" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
