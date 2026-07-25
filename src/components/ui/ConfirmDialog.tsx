import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = '确认删除',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onCancel, loading])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-md animate-fade-in-up" style={{ animationDuration: '0.2s' }} onClick={onCancel} />

      <div className="relative glass-popup max-w-sm w-full p-7 animate-scale-in">
        {/* 顶部折光 */}
        <div className="absolute top-2 left-7 right-7 h-px bg-gradient-to-r from-transparent via-red-400/40 to-transparent" />

        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-500/12 border-2 border-red-400/30 flex items-center justify-center animate-stamp-press">
          <AlertTriangle className="w-6 h-6 text-red-300" />
        </div>

        <h3 className="text-[17px] font-serif font-semibold text-dusk-50 text-center mb-2 tracking-[0.04em]">{title}</h3>
        <p className="text-[13px] text-dusk-100/65 text-center leading-relaxed mb-7 tracking-[0.01em]">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl text-[13px] font-medium text-dusk-100/70 bg-white/8 border border-dusk-300/20 hover:bg-white/12 transition-colors disabled:opacity-50 active:scale-[0.98] duration-200"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl text-[13px] font-semibold text-white bg-red-500/85 hover:bg-red-500 transition-all active:scale-[0.98] duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                删除中
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
