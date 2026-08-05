import type { Photo } from '../../types'
import { formatRecordDate } from '../../lib/dates'

interface TimelineItemProps {
  record: Photo
  index: number
  isFirstInMonth?: boolean
  onClick: () => void
}

// 多种 emoji 城市占位 — 当无照片时使用
const EMOJI_POOL = ['🌿', '🌊', '🍵', '🌙', '☕', '🍂', '🌸', '🍃', '⛰️', '🌸']

export function TimelineItem({ record, index, isFirstInMonth = false, onClick }: TimelineItemProps) {
  const dateStr = formatRecordDate(record.record_date, record.created_at, {
    month: 'long', day: 'numeric', weekday: 'short',
  })

  const hasPhoto = !!record.image_url
  const emoji = EMOJI_POOL[index % EMOJI_POOL.length]

  const marginClass = isFirstInMonth ? 'mb-7' : 'mb-4'

  return (
    <div
      className={`relative pl-[56px] pr-5 ${marginClass} animate-card-enter`}
      style={{ opacity: 0, animationDelay: `${index * 0.06}s` }}
    >
      {/* 时间线圆点 */}
      <span
        className={`timeline-dot ${hasPhoto ? '' : 'note'}`}
        style={{ top: '20px' }}
        aria-hidden="true"
      />

      <button
        onClick={onClick}
        className="block w-full text-left active:scale-[0.99] transition-transform duration-200"
      >
        <div className="flex gap-3">
          {/* 左侧 56px emoji 缩略图 */}
          <div
            className="flex-shrink-0 rounded-[12px] overflow-hidden flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              background: hasPhoto
                ? 'transparent'
                : 'linear-gradient(135deg, rgba(37,208,122,0.08) 0%, rgba(37,208,122,0.04) 100%)',
              border: hasPhoto ? 'none' : '1px solid rgba(37,208,122,0.15)',
            }}
          >
            {hasPhoto ? (
              <img
                src={record.image_url!}
                alt={record.note || record.city_name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-[24px]">{emoji}</span>
            )}
          </div>

          {/* 右侧城市 + 心情 + 时间戳 */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-display font-semibold text-text-primary text-[14px] tracking-[0.02em] truncate">
                📍 {record.city_name}
              </h4>
              <span className="text-[10px] text-text-muted font-mono tracking-[0.02em] flex-shrink-0">
                {dateStr}
              </span>
            </div>
            <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2 mt-1 tracking-[0.01em]">
              {record.note || '（随手记录的瞬间）'}
            </p>
          </div>
        </div>
      </button>
    </div>
  )
}
