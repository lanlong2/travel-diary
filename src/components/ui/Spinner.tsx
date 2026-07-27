interface SpinnerProps {
  className?: string
  label?: string
}

export function Spinner({ className = '', label = '\u52a0\u8f7d\u4e2d' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-dusk-300/25 border-t-amber"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
