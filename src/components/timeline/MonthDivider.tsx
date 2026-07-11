interface MonthDividerProps {
  label: string
}

export function MonthDivider({ label }: MonthDividerProps) {
  return (
    <div className="flex items-center gap-3 mx-3 sm:mx-6 my-5">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-dusk-300/30" />
      <span className="text-[11px] text-dusk-100/50 font-mono tracking-[0.2em] whitespace-nowrap uppercase">
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-dusk-300/30" />
    </div>
  )
}
