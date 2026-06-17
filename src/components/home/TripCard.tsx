import { useState } from 'react'
import type { Trip } from '../../types'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface TripCardProps {
  trip: Trip
  cityCount: number
  onClick: () => void
  onDelete: (id: string) => Promise<void>
  index?: number
}

const PALETTES = [
  { bg: 'from-amber-100 to-orange-100', badge: 'bg-amber-50 text-amber-700', icon: '🏔️' },
  { bg: 'from-rose-100 to-pink-100', badge: 'bg-rose-50 text-rose-700', icon: '🌸' },
  { bg: 'from-sky-100 to-blue-100', badge: 'bg-sky-50 text-sky-700', icon: '🌊' },
  { bg: 'from-emerald-100 to-teal-100', badge: 'bg-emerald-50 text-emerald-700', icon: '🌿' },
  { bg: 'from-violet-100 to-purple-100', badge: 'bg-violet-50 text-violet-700', icon: '🌙' },
  { bg: 'from-yellow-50 to-amber-50', badge: 'bg-yellow-50 text-amber-700', icon: '☀️' },
]

export function TripCard({ trip, cityCount, onClick, onDelete, index = 0 }: TripCardProps) {
  const palette = PALETTES[Math.abs(trip.title.charCodeAt(0)) % PALETTES.length]
  const staggerClass = index < 5 ? `animate-fade-in-up stagger-${index + 1}` : ''
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const duration = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(trip.id)
    setDeleting(false)
    setShowDelete(false)
  }

  return (
    <>
      <div
        onClick={onClick}
        className={`min-w-[190px] bg-white/90 rounded-2xl overflow-hidden border border-warm-200/60 shadow-sm hover:shadow-lg active:scale-[0.97] transition-transform duration-150 cursor-pointer flex-shrink-0 transition-all duration-300 relative group ${staggerClass}`}
        style={{ opacity: 0 }}
      >
        {/* 封面区 */}
        <div className={`relative h-32 bg-gradient-to-br ${palette.bg} flex items-center justify-center overflow-hidden`}>
          {/* 纸胶带 */}
          <div className="absolute -top-1 left-7 w-14 h-5 bg-warm-300/40 rounded-sm -rotate-3 blur-[0.5px] z-10" />
          <div className="absolute top-3 right-5 w-10 h-4 bg-warm-200/50 rounded-sm rotate-6 blur-[0.5px] z-10" />

          {trip.cover_photo ? (
            <img
              src={trip.cover_photo}
              alt={trip.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl drop-shadow-sm">{palette.icon}</span>
          )}

          {/* 删除按钮 — 移动端常显，桌面端 hover 显示 */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowDelete(true) }}
            className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-white/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-400 z-10 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 max-sm:opacity-100 max-sm:bg-white/60"
            title="删除旅行"
          >
            <Trash2 className="w-4 h-4 text-warm-400" />
          </button>

          {/* 日期标签 */}
          <div className={`absolute bottom-3 left-3 px-2.5 py-1 ${palette.badge} rounded-lg text-xs font-medium tracking-wide backdrop-blur-sm`}>
            {new Date(trip.start_date).getFullYear()} · {new Date(trip.start_date).toLocaleDateString('zh-CN', { month: 'short' })}
          </div>
        </div>

        {/* 信息区 */}
        <div className="px-4 py-3.5">
          <h4 className="font-bold text-base text-warm-900 truncate leading-snug">{trip.title}</h4>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-wood/60">{cityCount} 座城市</span>
            <span className="w-1 h-1 rounded-full bg-warm-300" />
            <span className="text-xs text-wood/60">{duration} 天</span>
            <span className="w-1 h-1 rounded-full bg-warm-300" />
            <span className="text-xs text-wood/60">
              {new Date(trip.start_date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {showDelete && (
        <ConfirmDialog
          title="删除旅行"
          message={`确定要删除「${trip.title}」吗？这次旅行的所有照片也会被删除，此操作无法撤销。`}
          confirmLabel="确认删除"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}
    </>
  )
}
