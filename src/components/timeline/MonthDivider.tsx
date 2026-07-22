interface MonthDividerProps {
  label: string
}

export function MonthDivider({ label }: MonthDividerProps) {
  return (
    <div className="flex items-center gap-3 mx-3 sm:mx-6 my-6 ml-[44px] sm:ml-[68px] animate-fade-in-up">
      {/* 左侧细线 */}
      <div className="flex-1 max-w-[20px] h-px bg-gradient-to-r from-transparent to-amber/30" />

      {/* 简洁月份标签 */}
      <div
        className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md"
        style={{
          background: 'oklch(40% 0.03 45 / 0.5)',
          borderColor: 'oklch(80% 0.12 70 / 0.25)',
        }}
      >
        <span
          className="inline-block w-[5px] h-[5px] bg-amber/70 rounded-full"
          aria-hidden="true"
        />
        <span className="text-[11px] text-dusk-50/90 font-mono tracking-[0.05em] whitespace-nowrap">
          {label}
        </span>
      </div>

      {/* 右侧细线 */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber/30" />
    </div>
  )
}
