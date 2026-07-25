export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 border-2 border-dusk-300/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-amber rounded-full animate-spin" style={{ animationDuration: '0.9s' }} />
        <div className="absolute inset-1 border-2 border-transparent border-b-amber/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.4s' }} />
        {/* 内发射光晕 */}
        <div
          className="absolute inset-0 rounded-full animate-ping-soft"
          style={{
            border: '1px solid oklch(68% 0.17 40 / 0.15)',
            animationDuration: '2.5s',
          }}
        />
      </div>
    </div>
  )
}
