export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border-[2px] border-dusk-400 border-t-amber rounded-full animate-spin" />
    </div>
  )
}
