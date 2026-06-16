import { useDaysCount } from '../../hooks/useDaysCount'

export function DayCounter() {
  const { days, startDateStr } = useDaysCount()
  const months = Math.floor(days / 30)

  return (
    <div className="mx-6 mt-6 animate-fade-in-down">
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl px-6 py-6 border border-warm-200/80 overflow-hidden">
        {/* 纸胶带 */}
        <div className="absolute -top-1 left-10 w-20 h-6 bg-warm-500/20 rounded-sm -rotate-6 blur-[1px]" />
        <div className="absolute -top-2 right-12 w-14 h-5 bg-blush/30 rounded-sm rotate-[8deg] blur-[1px]" />

        {/* 背景装饰 */}
        <div className="absolute -right-4 -bottom-4 w-36 h-36 rounded-full bg-gradient-to-br from-warm-100/60 to-transparent" />
        <div className="absolute right-10 top-4 w-4 h-4 rounded-full bg-warm-400/20" />
        <div className="absolute right-20 top-8 w-2.5 h-2.5 rounded-full bg-warm-300/30" />
        <div className="absolute left-4 bottom-4 w-2 h-2 rounded-full bg-blush/30" />

        {/* 标题区 */}
        <div className="relative text-center mb-5">
          <p className="inline-flex items-center justify-center gap-2.5 text-sm text-warm-500/80 font-medium tracking-wider">
            <span className="w-5 h-[1px] bg-warm-300/40" />
            <span className="animate-heartbeat inline-block text-base">💕</span>
            <span className="w-5 h-[1px] bg-warm-300/40" />
          </p>
          <h2 className="mt-2.5 text-[22px] font-bold text-warm-700 tracking-[0.15em]">
            崔浩和李沐桐
          </h2>
          <p className="mt-1.5 text-xs text-wood/45 tracking-wider">在一起的第</p>
        </div>

        {/* 天数印章 */}
        <div className="relative flex justify-center mb-4">
          <div className="relative">
            <div className="w-[96px] h-[96px] rounded-2xl bg-gradient-to-br from-caramel to-warm-500 flex flex-col items-center justify-center shadow-lg shadow-warm-500/25">
              <span className="text-white text-[40px] font-black leading-none">{days}</span>
              <span className="text-white/80 text-sm font-medium tracking-widest mt-0.5">天</span>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blush rounded-full border-[3px] border-cream animate-heartbeat" />
          </div>
        </div>

        {/* 底部信息 */}
        <div className="relative text-center">
          <p className="text-xs text-wood/40">
            从 {startDateStr} 开始 · 已携手走过 {months} 个月
          </p>
        </div>
      </div>
    </div>
  )
}
