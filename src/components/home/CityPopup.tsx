import { MapPin, ImageOff, ChevronRight } from 'lucide-react'
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

  return (
    <div
      className="absolute z-30"
      style={{
        left: x,
        top: y - 28,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 bg-glass-popup rotate-45 border-r border-b border-dusk-300/30" />

      <div className="glass-popup w-[290px] overflow-hidden animate-scale-in" style={{ animationDuration: '0.2s', boxShadow: '0 24px 64px oklch(15% 0.02 40 / 0.6), 0 0 0 1px oklch(80% 0.14 60 / 0.2), inset 0 1px 0 oklch(96% 0.02 70 / 0.12)' }}>
        {/* 顶部折光线 */}
        <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent" />
        <div className="p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-[10px] bg-amber/15 border border-amber/25 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-amber" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-serif font-semibold text-dusk-50 text-[15px] leading-tight truncate tracking-[0.03em]">
                {city.city_name}
              </h4>
              <p className="text-[10px] text-dusk-100/55 tracking-[0.04em] mt-0.5 font-mono">
                {city.visit_count} 次到访 · {city.photo_count} 张照片
              </p>
            </div>
          </div>

          {cityPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {cityPhotos.map((p) => (
                <div key={p.id} className="relative">
                  <div className="aspect-[4/3] rounded-[6px] overflow-hidden bg-dusk-700 border border-dusk-300/20">
                    <img
                      src={p.image_url ?? ''}
                      alt={p.note || city.city_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
              {city.photo_count > 4 && (
                <div className="aspect-[4/3] rounded-[6px] bg-amber/10 border border-amber/25 flex items-center justify-center">
                  <span className="text-[13px] text-amber font-semibold tabular-nums">+{city.photo_count - 4}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-3 py-4 rounded-[6px] bg-dusk-800/40 border border-dashed border-dusk-300/30">
              <ImageOff className="w-4 h-4 text-dusk-100/40" />
              <span className="text-[11px] text-dusk-100/50">还没有照片</span>
            </div>
          )}

          {latestNote && (
            <div className="mb-3 pl-3 border-l-2 border-amber/50">
              <p className="text-[11px] text-dusk-100/75 leading-relaxed line-clamp-2 italic font-serif">
                {latestNote}
              </p>
            </div>
          )}

          <div className="h-px bg-gradient-to-r from-transparent via-dusk-300/30 to-transparent mb-3" />

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {city.trips.slice(0, 2).map((t, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 bg-white/8 rounded-full text-dusk-100/70 font-medium tracking-[0.03em]"
                >
                  {t}
                </span>
              ))}
              {city.trips.length > 2 && (
                <span className="text-[10px] px-1 py-0.5 text-dusk-100/40">
                  +{city.trips.length - 2}
                </span>
              )}
            </div>

            <span className="flex items-center gap-0.5 text-[10px] text-amber font-medium tracking-[0.03em]">
              查看详情
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
