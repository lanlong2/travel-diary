interface MonthDividerProps {
  label: string
}

export function MonthDivider({ label }: MonthDividerProps) {
  return (
    <div className="flex items-center gap-3 mx-6 my-5">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-warm-300/50 to-warm-300/50" />
      <span className="text-xs text-warm-400 font-medium italic tracking-wider whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-warm-300/50 to-warm-300/50" />
    </div>
  )
}
