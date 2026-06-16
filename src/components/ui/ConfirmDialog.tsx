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
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-scale-in">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* 对话框 */}
      <div className="relative bg-cream rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-warm-200/80 animate-fade-in-up">
        {/* 图标 */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>

        <h3 className="text-lg font-bold text-warm-900 text-center mb-1.5">{title}</h3>
        <p className="text-sm text-warm-400 text-center leading-relaxed mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-warm-500 bg-warm-100 border border-warm-200/60 hover:bg-warm-200/60 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white bg-red-400 hover:bg-red-500 shadow-lg shadow-red-400/20 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                删除中...
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
