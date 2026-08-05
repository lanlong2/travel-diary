import type { Photo } from '../../types'
import { MapPin } from 'lucide-react'
import { formatRecordDate } from '../../lib/dates'

interface TimelineCardProps {
  record: Photo
  index: number
  isFirstInMonth?: boolean
  onClick: () => void
}

export function TimelineCard({ record, index, isFirstInMonth = false, onClick }: TimelineCardProps) {
  const dateStr = formatRecordDate(record.record_date, record.created_at, {
    month: 'long', day: 'numeric', weekday: 'short',
  })

  const hasPhoto = !!record.image_url

  const marginClass = isFirstInMonth ? 'mb-8' : 'mb-5'

  return (
    <div
      className={`relative pl-[48px] pr-4 sm:pr-6 ${marginClass} animate-fade-in-up`}
      style={{ opacity: 0, animationDelay: `${index * 0.06}s` }}
    >
      <span
        className={`timeline-dot ${hasPhoto ? '' : 'note'}`}
        style={{ top: '14px' }}
        aria-hidden="true"
      />

      <button
        onClick={onClick}
        className="block w-full text-left active:brightness-95 transition-all duration-200 group"
      >
        {hasPhoto ? (
          // 拍立得风格照片卡 — 偏暖白底，hover 增强
          <div className="polaroid-frame rounded-[2px] transition-all duration-500 group-hover:shadow-[0_20px_48px_oklch(15%_0.02_40_/_0.6),0_0_0_1px_oklch(80%_0.14_60_/_0.3)]">
            <div className="aspect-[4/3] overflow-hidden bg-dusk-600 rounded-[1px] relative">
              <img
                src={record.image_url!}
                alt={record.note || record.city_name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              {/* hover 彩色叠加 */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, oklch(68% 0.17 40 / 0.08), transparent 50%)' }}
              />
            </div>
            {record.note && (
              <div className="px-1 pt-2 pb-1">
                <p className="text-[13px] text-dusk-900/85 leading-snug font-medium italic line-clamp-2 text-balance font-serif">
                  {`「${record.note}」`}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between gap-2 px-1 pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] text-dusk-900/55 font-mono tracking-[0.04em]">
                <MapPin className="w-3 h-3" />
                {record.city_name}
              </span>
              <span className="text-[10px] text-dusk-900/55 font-mono tracking-[0.04em]">{dateStr}</span>
            </div>
          </div>
        ) : (
          // 信纸风格便签 — 不规则横线，hover 增强
          <div className="glass-card glass-card-elevated letter-paper rounded-[14px] p-4 sm:p-5 relative overflow-hidden hover-lift transition-all duration-400">
            <span
              className="absolute top-3 left-2 w-[3px] h-[3px] rounded-full bg-amber/45"
              aria-hidden="true"
            />
            <div className="flex items-start gap-2 mb-1">
              <span className="font-serif text-2xl text-amber/65 leading-none">"</span>
              <p className="text-[14px] sm:text-[15px] text-dusk-50/90 leading-relaxed whitespace-pre-wrap flex-1 pt-1 italic">
                {record.note}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-dusk-300/15">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2 py-0.5 bg-amber/15 border border-amber/25 rounded-lg text-amber font-medium tracking-[0.04em]">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[5em]">{record.city_name}</span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-dusk-100/55 font-mono tracking-[0.04em]">{dateStr}</span>
            </div>
          </div>
        )}
      </button>
    </div>
  )
}
