import type { Photo } from '../../types'
import { MapPin } from 'lucide-react'

interface TimelineCardProps {
  record: Photo
  index: number
  onClick: () => void
}

export function TimelineCard({ record, index, onClick }: TimelineCardProps) {
  const dateStr = new Date(record.created_at).toLocaleDateString('zh-CN', {
    month: 'long', day: 'numeric', weekday: 'short',
  })

  return (
    <button
      onClick={onClick}
      className="block text-left mx-3 sm:mx-6 mb-3 sm:mb-4 active:scale-[0.98] transition-transform duration-150 animate-fade-in-up relative"
      style={{ opacity: 0, animationDelay: `${index * 0.06}s` }}
    >
      {record.image_url ? (
        <div className="glass-card overflow-hidden">
          <div className="aspect-[4/3] overflow-hidden bg-dusk-600">
            <img
              src={record.image_url}
              alt={record.note || record.city_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {record.note && (
            <div className="px-4 py-3">
              <p className="text-sm text-dusk-50/90 leading-relaxed font-medium italic line-clamp-2 text-balance">
                「{record.note}」
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-start gap-2 mb-2">
            <span className="font-serif text-2xl text-amber/60 leading-none">"</span>
            <p className="text-sm sm:text-base text-dusk-50/90 leading-relaxed whitespace-pre-wrap flex-1 pt-1">
              {record.note}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-2 px-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-white/8 rounded-lg text-amber font-medium flex items-center gap-1 shrink-0 tracking-wide">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[5em]">{record.city_name}</span>
          </span>
        </div>
        <span className="text-[10px] sm:text-xs text-dusk-100/40 font-mono shrink-0">{dateStr}</span>
      </div>
    </button>
  )
}
