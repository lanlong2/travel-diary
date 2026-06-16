export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border-[3px] border-warm-200 border-t-warm-500 rounded-full animate-spin" />
    </div>
  )
}
