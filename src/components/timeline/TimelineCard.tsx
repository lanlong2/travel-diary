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
      className="w-full text-left mx-6 mb-4 active:scale-[0.98] transition-transform duration-150 animate-fade-in-up relative overflow-hidden rounded-2xl"
      style={{ opacity: 0 }}
    >
      {record.image_url ? (
        /* 照片卡片 — 拍立得 */
        <div className="polaroid !p-3 !pb-6 rounded-xl">
          <div className="aspect-[4/3] rounded-sm overflow-hidden bg-warm-100 mb-3">
            <img
              src={record.image_url}
              alt={record.note || record.city_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {record.note && (
            <p className="text-sm text-wood/70 text-center leading-relaxed font-medium italic px-2 line-clamp-2">
              「{record.note}」
            </p>
          )}
        </div>
      ) : (
        /* 文字卡片 — 便签风格 */
        <div className="bg-[#fff9f0] border border-warm-200/60 rounded-2xl p-5 shadow-sm"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(180,150,120,0.06) 27px, rgba(180,150,120,0.06) 28px)',
            backgroundPosition: '0 8px',
          }}
        >
          <p className="text-base text-warm-800 leading-relaxed whitespace-pre-wrap">
            {record.note}
          </p>
        </div>
      )}

      {/* 底部信息条 */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 bg-warm-100 rounded-lg text-warm-500 font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {record.city_name}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            record.author === '我' ? 'bg-blue-50 text-blue-400' : 'bg-pink-50 text-pink-400'
          }`}>
            {record.author === '我' ? '💙' : '💗'}
          </span>
        </div>
        <span className="text-xs text-warm-300 italic">{dateStr}</span>
      </div>
    </button>
  )
}
