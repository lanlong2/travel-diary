import { useDaysCount } from '../../hooks/useDaysCount'
import { useCountUp } from '../../hooks/useCountUp'

/**
 * 首页封面区 — 大数字「天数」+ 崔浩 & 李沐桐 + 日期信息。
 * 脉冲绿光晕环绕数字。仅在深色 hero 区使用。
 */
export function HeroCounter() {
  const { days, startDateStr } = useDaysCount()
  const animatedDays = useCountUp(days, 1100)
  const months = Math.floor(days / 30)

  return (
    <div className="relative px-7 pt-14 pb-10 text-center animate-hero-enter">
      <p className="text-[12px] text-white/55 tracking-[0.4em] uppercase font-medium">
        在一起的第
      </p>

      <div className="my-2 flex items-end justify-center gap-3 relative">
        {/* 脉冲绿光晕 — 在数字背后 */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse-glow pointer-events-none"
          style={{ width: 200, height: 200 }}
          aria-hidden="true"
        />
        <span
          className="relative font-display font-bold text-[108px] leading-none text-white tracking-tight animate-number-count"
          style={{
            textShadow: '0 4px 40px rgba(37,208,122,0.4), 0 0 80px rgba(37,208,122,0.2)',
          }}
        >
          {animatedDays}
        </span>
        <span className="text-[16px] text-white/75 tracking-[0.05em] pb-5 font-medium">天</span>
      </div>

      <h2 className="font-display font-bold text-[22px] text-white tracking-[0.1em] mt-1">
        崔浩 &amp; 李沐桐
      </h2>

      <div className="mt-3 flex items-center justify-center gap-2.5 text-[11px] text-white/50 tracking-[0.02em] font-mono">
        <span>从 {startDateStr}</span>
        <span className="w-1 h-1 rounded-full bg-amber/60" />
        <span>已携手 {months} 个月</span>
      </div>
    </div>
  )
}
