interface MonthDividerProps {
  label: string
}

export function MonthDivider({ label }: MonthDividerProps) {
  return (
    <div className="flex items-center gap-3 mx-3 sm:mx-6 my-6 ml-[44px] sm:ml-[68px] animate-fade-in-up">
      {/* 左侧细线 */}
      <div className="flex-1 max-w-[20px] h-px bg-gradient-to-r from-transparent to-amber/30" />

      {/* 琥珀胶囊 */}
      <div
        className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md"
        style={{
          background: 'linear-gradient(135deg, oklch(68% 0.17 40 / 0.15), oklch(55% 0.15 35 / 0.10))',
          borderColor: 'oklch(80% 0.12 70 / 0.4)',
          boxShadow: 'inset 0 1px 0 oklch(96% 0.02 70 / 0.2), 0 4px 14px oklch(15% 0.02 280 / 0.25)',
        }}
      >
        {/* 菱形装饰 */}
        <span
          className="inline-block w-[6px] h-[6px] bg-amber rotate-45"
          style={{ boxShadow: '0 0 8px oklch(68% 0.17 40 / 0.6)' }}
          aria-hidden="true"
        />
        <span className="text-[11px] text-dusk-50 font-mono tracking-[0.25em] whitespace-nowrap uppercase">
          {label}
        </span>
        <span
          className="inline-block w-[6px] h-[6px] bg-amber/60 rotate-45"
          aria-hidden="true"
        />
      </div>

      {/* 右侧细线 */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber/25 to-amber/30" />
    </div>
  )
}
