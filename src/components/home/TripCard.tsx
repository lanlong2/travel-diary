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

export function TripCard({ trip, cityCount, onClick, onDelete, index = 0 }: TripCardProps) {
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
        className={`min-w-[210px] glass-card overflow-hidden hover-lift active:brightness-95 transition-all duration-200 cursor-pointer flex-shrink-0 relative group ${staggerClass}`}
        style={{ opacity: 0 }}
      >
        <div className="relative h-36 overflow-hidden">
          {trip.cover_photo ? (
            <img
              src={trip.cover_photo}
              alt={trip.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103 group-hover:brightness-105"
            />
          ) : (
            // 无封面：星座连线背景
            <div className="absolute inset-0 bg-gradient-to-br from-dusk-500 to-dusk-700 flex items-center justify-center">
              <svg
                className="absolute inset-0 w-full h-full opacity-25"
                viewBox="0 0 210 144"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <g stroke="#c4735a" strokeWidth="0.6" fill="#c4735a">
                  <line x1="30" y1="40" x2="80" y2="60" />
                  <line x1="80" y1="60" x2="140" y2="35" />
                  <line x1="140" y1="35" x2="180" y2="80" />
                  <line x1="180" y1="80" x2="100" y2="110" />
                  <line x1="100" y1="110" x2="40" y2="95" />
                  <line x1="40" y1="95" x2="30" y2="40" />
                  <circle cx="30" cy="40" r="1.8" />
                  <circle cx="80" cy="60" r="2.2" />
                  <circle cx="140" cy="35" r="1.6" />
                  <circle cx="180" cy="80" r="2" />
                  <circle cx="100" cy="110" r="2.4" />
                  <circle cx="40" cy="95" r="1.8" />
                </g>
              </svg>
              <span className="font-display italic font-semibold text-2xl text-terracotta/85 tracking-[0.02em] relative">
                {trip.title.slice(0, 2)}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-dusk-900/70 via-dusk-900/10 to-transparent" />

          <button
            onClick={(e) => { e.stopPropagation(); setShowDelete(true) }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-[10px] bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-red-500/40 hover:text-white text-dusk-50/80 z-10 transition-colors duration-200 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="删除旅行"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between">
            <h4 className="font-serif font-semibold text-[17px] text-dusk-50 leading-tight tracking-[0.02em] text-balance">
              {trip.title}
            </h4>
          </div>

          {/* 年份贴纸 — 略微旋转 */}
          <div className="absolute top-3 left-3.5">
            <span
              className="font-mono text-[11px] text-dusk-50/95 px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-md tracking-[0.02em] inline-block"
              style={{ transform: 'rotate(-2deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}
            >
              {new Date(trip.start_date).getFullYear()}.
              {String(new Date(trip.start_date).getMonth() + 1).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="px-4 py-3 flex items-center gap-3 text-[11px] text-dusk-100/60 tracking-[0.02em]">
          <span>{cityCount} 城</span>
          <span className="w-1 h-1 rounded-full bg-terracotta/50" />
          <span>{duration} 天</span>
          <span className="w-1 h-1 rounded-full bg-terracotta/50" />
          <span className="font-mono">
            {new Date(trip.start_date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
          </span>
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
