interface MonthDividerProps {
  label: string
}

export function MonthDivider({ label }: MonthDividerProps) {
  return (
    <div className="flex items-center gap-3 mr-4 my-7 ml-[48px] animate-fade-in-up">
      {/* 左侧细线 */}
      <div className="flex-1 max-w-[28px] h-px bg-gradient-to-r from-transparent to-amber/40" />

      {/* 邮戳式月份标签 */}
      <div
        className="relative inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border backdrop-blur-md"
        style={{
          background: 'oklch(40% 0.03 45 / 0.55)',
          borderColor: 'oklch(80% 0.12 70 / 0.3)',
          boxShadow: 'inset 0 1px 0 oklch(96% 0.02 70 / 0.1), 0 2px 8px oklch(15% 0.02 40 / 0.3)',
        }}
      >
        <span
          className="inline-block w-[5px] h-[5px] bg-amber/80 rounded-full"
          style={{ boxShadow: '0 0 4px oklch(68% 0.17 40 / 0.6)' }}
          aria-hidden="true"
        />
        <span className="text-[11px] text-dusk-50/95 font-mono tracking-[0.08em] whitespace-nowrap">
          {label}
        </span>
      </div>

      {/* 右侧细线 */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber/40" />
    </div>
  )
}
