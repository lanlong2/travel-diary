import { useDaysCount } from '../../hooks/useDaysCount'

export function DayCounter() {
  const { days, startDateStr } = useDaysCount()
  const months = Math.floor(days / 30)

  return (
    <div className="mx-6 mt-8 animate-fade-in-down">
      <div className="glass-card px-6 py-8 text-center relative overflow-hidden">
        <p className="text-xs text-dusk-100/60 tracking-[0.3em] uppercase">
          在一起的第
        </p>

        <div className="my-4 flex items-end justify-center gap-2">
          <span
            className="font-serif font-black text-[88px] leading-none text-amber tracking-tight animate-heartbeat"
            style={{ textShadow: '0 0 48px oklch(68% 0.17 40 / 0.45)' }}
          >
            {days}
          </span>
          <span className="text-sm text-dusk-100/70 tracking-[0.2em] pb-3">天</span>
        </div>

        <h2 className="font-serif font-semibold text-[20px] text-dusk-50 tracking-[0.25em]">
          崔浩 & 李沐桐
        </h2>

        <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-dusk-100/50 tracking-wider">
          <span>从 {startDateStr}</span>
          <span className="w-1 h-1 rounded-full bg-amber/60" />
          <span>已携手 {months} 个月</span>
        </div>
      </div>
    </div>
  )
}
