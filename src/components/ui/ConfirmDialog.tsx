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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-scale-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onCancel} />

      <div className="relative glass-popup max-w-sm w-full p-6 animate-fade-in-up">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/15 border border-red-400/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>

        <h3 className="text-lg font-serif font-semibold text-dusk-50 text-center mb-1.5 tracking-wide">{title}</h3>
        <p className="text-sm text-dusk-100/60 text-center leading-relaxed mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-dusk-100/70 bg-white/8 border border-dusk-300/20 hover:bg-white/12 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white bg-red-500/80 hover:bg-red-500 shadow-lg shadow-red-500/25 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
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
