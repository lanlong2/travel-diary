import { MapPin, Camera, ImageOff, ChevronRight } from 'lucide-react'
import type { CitySummary, Photo } from '../../types'

interface CityTooltipProps {
  city: CitySummary
  photos: Photo[]
  x: number
  y: number
}

export function CityPopup({ city, photos, x, y }: CityTooltipProps) {
  const cityPhotos = photos
    .filter((p) => p.city_name === city.city_name)
    .slice(0, 4)

  const latestNote = photos
    .filter((p) => p.city_name === city.city_name && p.note)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.note

  const photoGridClass =
    cityPhotos.length <= 2
      ? 'grid-cols-2'
      : 'grid-cols-2'

  return (
    <div
      className="absolute z-30"
      style={{
        left: x,
        top: y - 28,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {/* 向下箭头 — 更大更明显 */}
      <div className="absolute left-1/2 -bottom-[7px] -translate-x-1/2 w-3.5 h-3.5 bg-white rotate-45 border-r border-b border-warm-200/70 shadow-[2px_2px_4px_rgba(0,0,0,0.04)]" />

      <div className="bg-white/98 backdrop-blur-2xl rounded-[20px] border border-warm-200/50 shadow-[0_8px_32px_rgba(92,61,46,0.10),0_2px_8px_rgba(92,61,46,0.06)] w-[290px] overflow-hidden animate-scale-in">
        {/* 顶部彩色条 + 纸胶带 */}
        <div className="h-1 bg-gradient-to-r from-caramel via-warm-400 to-blush" />
        <div className="absolute top-0.5 left-6 w-12 h-[6px] bg-warm-400/30 -rotate-3 rounded-sm blur-[0.5px]" />

        <div className="p-4">
          {/* 城市名 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-caramel/15 to-warm-400/15 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-caramel" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-warm-800 text-[15px] leading-tight truncate">
                {city.city_name}
              </h4>
              <p className="text-[10px] text-wood/40">
                {city.visit_count} 次到访 · {city.photo_count} 张照片
              </p>
            </div>
          </div>

          {/* 照片网格 */}
          {cityPhotos.length > 0 ? (
            <div className={`grid ${photoGridClass} gap-2 mb-3`}>
              {cityPhotos.map((p) => (
                <div
                  key={p.id}
                  className="relative group/pic"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-warm-100 border border-warm-200/40 shadow-sm">
                    <img
                      src={p.image_url}
                      alt={p.note || city.city_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {/* 照片上的小纸胶带 */}
                  <div className="absolute -top-1 left-3 w-8 h-[5px] bg-warm-300/40 -rotate-2 rounded-sm blur-[0.5px]" />
                </div>
              ))}
              {city.photo_count > 4 && (
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-warm-50 to-warm-100 border border-warm-200/30 flex items-center justify-center">
                  <span className="text-sm text-warm-400 font-semibold">+{city.photo_count - 4}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-3 py-4 rounded-xl bg-warm-50/60 border border-dashed border-warm-200/50">
              <ImageOff className="w-5 h-5 text-warm-300" />
              <span className="text-xs text-warm-400">还没有照片</span>
            </div>
          )}

          {/* 最新记录 */}
          {latestNote && (
            <div className="relative mb-3">
              <div className="absolute top-0 left-0 text-[14px] text-warm-300/60 leading-none -translate-y-0.5">
                &ldquo;
              </div>
              <p className="text-xs text-wood/60 leading-relaxed pl-3 pr-1 line-clamp-2 italic">
                {latestNote}
              </p>
            </div>
          )}

          {/* 分隔线 */}
          <div className="h-px bg-gradient-to-r from-transparent via-warm-200/50 to-transparent mb-3" />

          {/* 标签 + 提示 */}
          <div className="flex items-center justify-between">
            {/* 旅行标签 */}
            <div className="flex flex-wrap gap-1">
              {city.trips.slice(0, 2).map((t, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 bg-warm-100/70 rounded-full text-warm-500 font-medium"
                >
                  {t}
                </span>
              ))}
              {city.trips.length > 2 && (
                <span className="text-[10px] px-2 py-0.5 text-wood/40">
                  +{city.trips.length - 2}
                </span>
              )}
            </div>

            {/* 点击提示 */}
            <span className="flex items-center gap-0.5 text-[10px] text-warm-400/70 font-medium">
              查看详情
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
