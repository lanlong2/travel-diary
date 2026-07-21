import { useDaysCount } from '../../hooks/useDaysCount'
import { useCountUp } from '../../hooks/useCountUp'

export function DayCounter() {
  const { days, startDateStr } = useDaysCount()
  const animatedDays = useCountUp(days, 1100)
  const months = Math.floor(days / 30)

  return (
    <div className="mx-6 mt-8 animate-fade-in-down">
      <div className="glass-card px-6 py-8 text-center relative overflow-hidden">
        {/* 顶部金点虚线装饰 */}
        <div className="flex items-center justify-center gap-2 mb-3" aria-hidden="true">
          <span className="w-1.5 h-1.5 rounded-full bg-amber/70" />
          <span className="w-10 h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent" style={{ backgroundImage: 'repeating-linear-gradient(90deg, oklch(68% 0.17 40 / 0.4) 0, oklch(68% 0.17 40 / 0.4) 3px, transparent 3px, transparent 6px)' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-amber/70" />
        </div>

        <p className="text-xs text-dusk-100/60 tracking-[0.3em] uppercase">
          在一起的第
        </p>

        <div className="my-4 flex items-end justify-center gap-2">
          <span
            className="font-serif font-black text-[88px] leading-none text-amber tracking-tight animate-count-pulse"
            style={{ textShadow: '0 0 48px oklch(68% 0.17 40 / 0.45)' }}
          >
            {animatedDays}
          </span>
          <span className="text-sm text-dusk-100/70 tracking-[0.2em] pb-3">天</span>
        </div>

        <h2 className="font-serif font-semibold text-[20px] text-dusk-50 tracking-[0.25em]">
          崔浩 & 李沐桐
        </h2>

        <div
          className="mt-4 flex items-center justify-center gap-3 text-[11px] text-dusk-100/50 tracking-wider animate-fade-in-up"
          style={{ animationDelay: '0.6s', opacity: 0 }}
        >
          <span>从 {startDateStr}</span>
          <span className="w-1 h-1 rounded-full bg-amber/60" />
          <span>已携手 {months} 个月</span>
        </div>

        {/* 底部琥珀渐变线 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, oklch(68% 0.17 40 / 0.55) 30%, oklch(55% 0.15 35 / 0.7) 50%, oklch(68% 0.17 40 / 0.55) 70%, transparent 100%)',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
