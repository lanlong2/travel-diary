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
        className={`min-w-[200px] glass-card overflow-hidden hover-lift active:scale-[0.97] transition-transform duration-150 cursor-pointer flex-shrink-0 relative group ${staggerClass}`}
        style={{ opacity: 0 }}
      >
        <div className="relative h-36 overflow-hidden">
          {trip.cover_photo ? (
            <img
              src={trip.cover_photo}
              alt={trip.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-dusk-500 to-dusk-700 flex items-center justify-center">
              <span className="font-serif font-semibold text-2xl text-amber/80 tracking-[0.15em]">
                {trip.title.slice(0, 2)}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-dusk-900/70 via-dusk-900/10 to-transparent" />

          <button
            onClick={(e) => { e.stopPropagation(); setShowDelete(true) }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-red-500/40 hover:text-white text-dusk-50/80 z-10 transition-all duration-200 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            title="删除旅行"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between">
            <h4 className="font-serif font-semibold text-[17px] text-dusk-50 leading-tight tracking-wide text-balance">
              {trip.title}
            </h4>
          </div>

          <div className="absolute top-3 left-3.5">
            <span className="font-mono text-[11px] text-dusk-50/90 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md tracking-wider">
              {new Date(trip.start_date).getFullYear()}
              .
              {String(new Date(trip.start_date).getMonth() + 1).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="px-4 py-3 flex items-center gap-3 text-[11px] text-dusk-100/60 tracking-wide">
          <span>{cityCount} 城</span>
          <span className="w-1 h-1 rounded-full bg-amber/50" />
          <span>{duration} 天</span>
          <span className="w-1 h-1 rounded-full bg-amber/50" />
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
