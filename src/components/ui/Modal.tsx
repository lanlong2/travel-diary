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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative glass-popup max-w-lg w-full max-h-[85vh] overflow-auto scrollbar-hide animate-scale-in">
        {/* 顶部折光线 */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent" />
        <div className="flex items-center justify-between p-5 border-b border-dusk-300/30">
          {title && (
            <h2 className="text-lg font-serif font-semibold text-dusk-50 tracking-[0.03em] flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-amber" aria-hidden="true" />
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            aria-label="关闭"
            className="p-2 rounded-xl hover:bg-white/10 transition-colors active:scale-90 active:rotate-90 duration-200"
          >
            <X className="w-5 h-5 text-dusk-100" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
