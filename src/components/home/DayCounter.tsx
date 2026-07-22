import { useDaysCount } from '../../hooks/useDaysCount'
import { useCountUp } from '../../hooks/useCountUp'

export function DayCounter() {
  const { days, startDateStr } = useDaysCount()
  const animatedDays = useCountUp(days, 1100)
  const months = Math.floor(days / 30)

  return (
    <div className="mx-7 mt-8 mb-10 animate-fade-in-down">
      <div className="relative px-5 py-7 text-center">
        {/* 左上角日期戳记 — 胶片感 */}
        <div
          className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.05em] text-amber/50"
          aria-hidden="true"
        >
          EST. 2023
        </div>

        <p className="text-[13px] text-dusk-100/60 tracking-[0.05em]">
          在一起的第
        </p>

        <div className="my-3 flex items-end justify-center gap-2">
          <span
            className="font-serif font-black text-[88px] leading-none text-amber tracking-tight animate-count-pulse"
            style={{
              textShadow: '0 0 48px oklch(68% 0.17 40 / 0.45)',
            }}
          >
            {animatedDays}
          </span>
          <span className="text-[15px] text-dusk-100/70 tracking-[0.02em] pb-4">天</span>
        </div>

        <h2 className="font-serif font-semibold text-[19px] text-dusk-50 tracking-[0.05em]">
          崔浩 & 李沐桐
        </h2>

        <div className="mt-4 flex items-center justify-center gap-2.5 text-[11px] text-dusk-100/50 tracking-[0.01em] animate-fade-in-up"
          style={{ animationDelay: '0.6s', opacity: 0 }}
        >
          <span>从 {startDateStr}</span>
          <span className="w-1 h-1 rounded-full bg-amber/50" />
          <span>已携手 {months} 个月</span>
        </div>

        {/* 底部中间一段渐变折痕 */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
          style={{
            width: '20%',
            background: 'linear-gradient(90deg, transparent 0%, oklch(68% 0.17 40 / 0.55) 30%, oklch(55% 0.15 35 / 0.7) 50%, oklch(68% 0.17 40 / 0.55) 70%, transparent 100%)',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
