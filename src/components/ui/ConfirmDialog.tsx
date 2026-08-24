import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'
import { useDialogAccessibility } from './dialogAccessibility'

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
  confirmLabel = '\u786e\u8ba4\u5220\u9664',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const messageId = useId()

  useDialogAccessibility({
    isOpen: true,
    onClose: onCancel,
    containerRef: dialogRef,
    initialFocusRef: cancelButtonRef,
    closeOnEscape: !loading,
  })

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in-up"
        style={{ animationDuration: '0.18s' }}
        onClick={loading ? undefined : onCancel}
      />

      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        tabIndex={-1}
        className="glass-popup relative max-h-[min(88dvh,640px)] w-full max-w-sm overflow-y-auto overscroll-contain rounded-2xl p-5 scrollbar-hide animate-scale-in sm:p-7"
        style={{ animationDuration: '0.2s' }}
      >
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-red-400/25 bg-red-500/10">
          <AlertTriangle aria-hidden="true" className="h-5 w-5 text-red-300" />
        </div>

        <h2 id={titleId} className="mb-2 text-center font-serif text-lg font-semibold text-dusk-50">
          {title}
        </h2>
        <p id={messageId} className="mb-6 text-center text-sm leading-6 text-dusk-100/75">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="min-h-12 rounded-[10px] border border-dusk-300/25 bg-white/[0.06] px-3 py-3 text-sm font-medium text-dusk-100/85 transition-colors hover:bg-white/[0.1] hover:text-dusk-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {'\u53d6\u6d88'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
            className="flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-red-300/15 bg-red-500/85 px-3 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_oklch(30%_0.12_25_/_0.25)] transition-colors hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />
                {'\u5220\u9664\u4e2d'}
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
