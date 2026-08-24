import { useDaysCount } from '../../hooks/useDaysCount'
import { useCountUp } from '../../hooks/useCountUp'

export function DayCounter() {
  const { days, startDateStr } = useDaysCount()
  const animatedDays = useCountUp(days, 1100)
  const months = Math.floor(days / 30)

  return (
    <div className="page-mx mt-7 mb-10 animate-fade-in-down relative">
      {/* 顶部章节标识 */}
      <div className="flex items-center gap-3 mb-5">
        <span className="editorial-chapter">CHAPTER · I</span>
        <span className="flex-1 h-px bg-gradient-to-r from-amber/40 to-transparent" />
        <span className="font-mono text-[10px] tracking-[0.12em] text-dusk-100/40">
          EST. 2025.11.08
        </span>
      </div>

      <div className="relative px-5 py-6 text-center" style={{ perspective: '1000px' }}>
        {/* 左上角日期戳记 — 胶片感 */}
        <div
          className="absolute top-2 left-2 flex flex-col items-start leading-tight"
          aria-hidden="true"
        >
          <span className="font-mono text-[9px] tracking-[0.12em] text-amber/55">EST.</span>
          <span className="font-mono text-[14px] font-bold tracking-[0.05em] text-stamp-ink">
            2025
          </span>
        </div>

        {/* 右上角邮戳 — 不规则磨损 */}
        <div
          className="absolute top-2 right-2 stamp-mark px-2.5 py-1"
          style={{ transform: 'rotate(4deg)' }}
          aria-hidden="true"
        >
          <span className="font-mono text-[8px] tracking-[0.12em] text-stamp-dim leading-none">
            DIARY
          </span>
          <span className="font-mono text-[10px] font-bold tracking-[0.05em] text-stamp-ink leading-tight">
            No.{String(days).padStart(3, '0')}
          </span>
        </div>

        <p className="font-serif text-[13px] text-dusk-100/75 tracking-[0.18em]">在一起的第</p>

        <div className="my-3 flex items-end justify-center gap-2 relative">
          {/* 数字 — Cormorant 大字 */}
          <span
            className="display-hero leading-none text-amber tracking-tight animate-count-pulse"
            style={{
              fontSize: 'clamp(3.5rem, 18vw, 6rem)',
              textShadow: '0 0 48px oklch(68% 0.17 40 / 0.45)',
            }}
          >
            {animatedDays}
          </span>
          <span className="font-serif text-[15px] text-dusk-100/75 tracking-[0.03em] pb-4">天</span>
        </div>

        <h2 className="display-hero text-[22px] text-dusk-50 tracking-[0.05em]">
          <span className="italic">Cui</span>
          <span className="text-amber mx-2 font-light">&amp;</span>
          <span className="italic">Li</span>
        </h2>

        <p className="font-serif text-[13px] text-dusk-100/55 tracking-[0.15em] mt-2">
          崔浩 与 李沐桐
        </p>

        <div
          className="mt-5 flex items-center justify-center gap-3 text-[11px] text-dusk-100/50 tracking-[0.04em] animate-fade-in-up font-mono"
          style={{ animationDelay: '0.6s', opacity: 0 }}
        >
          <span>从 {startDateStr}</span>
          <span className="w-1 h-1 rounded-full bg-amber/60" />
          <span>已携手 {months} 个月</span>
        </div>

        {/* 底部中间折痕 */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
          style={{
            width: '30%',
            background:
              'linear-gradient(90deg, transparent 0%, oklch(68% 0.17 40 / 0.55) 30%, oklch(55% 0.15 35 / 0.7) 50%, oklch(68% 0.17 40 / 0.55) 70%, transparent 100%)',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
