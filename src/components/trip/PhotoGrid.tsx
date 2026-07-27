import { useState } from 'react'
import type { Photo } from '../../types'
import { Camera, Trash2, MapPin } from 'lucide-react'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (photo: Photo) => void
  onDeletePhoto?: (id: string) => Promise<void>
}

const STICKY_COLORS = ['sticky-yellow', 'sticky-pink', 'sticky-blue', 'sticky-green'] as const

export function PhotoGrid({ photos, onPhotoClick, onDeletePhoto }: PhotoGridProps) {
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget || !onDeletePhoto) return
    setDeleting(true)
    await onDeletePhoto(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  if (photos.length === 0) {
    return (
      <div className="page-mx py-16 text-center animate-fade-in-up">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-amber/10 border border-amber/20">
          <Camera className="w-7 h-7 text-amber/60" />
        </div>
        <p className="text-[13px] text-dusk-50/80 font-medium tracking-[0.04em]">还没有记录</p>
        <p className="text-[11px] text-dusk-100/45 mt-2 tracking-[0.04em]">添加第一条记录</p>
      </div>
    )
  }

  return (
    <>
      <div className="page-mx">
        {/* 章节式标题 */}
        <div className="flex items-center gap-3 mb-5">
          <span className="editorial-chapter">II</span>
          <h3 className="font-serif text-[15px] font-semibold text-dusk-50 tracking-[0.05em]">
            回忆碎片
          </h3>
          <span className="font-mono text-[11px] text-amber/70 tabular-nums">{photos.length}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-amber/35 to-transparent" />
        </div>

        <div className="photo-grid">
          {photos.map((photo, i) => {
            if (photo.entry_type === 'note' || !photo.image_url) {
              const stickyClass = STICKY_COLORS[i % STICKY_COLORS.length]
              return (
                <div
                  key={photo.id}
                  className="break-inside-avoid relative group animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
                >
                  <div
                    className={`glass-card ${stickyClass} relative overflow-hidden hover-lift`}
                    style={{ transform: `rotate(${i % 2 === 0 ? -0.8 : 0.8}deg)` }}
                  >
                    <button
                      type="button"
                      aria-label={`查看记录：${photo.city_name}`}
                      onClick={() => onPhotoClick(photo)}
                      className="block w-full p-4 pr-12 text-left active:brightness-95 transition-all duration-300"
                    >
                      <span
                        className="absolute top-3 left-1.5 w-[3px] h-[3px] rounded-full bg-amber/40"
                        aria-hidden="true"
                      />
                      <div className="flex items-start gap-1.5 mb-2">
                        <span className="font-serif text-xl text-amber/65 leading-none -mt-1" aria-hidden="true">"</span>
                        <p className="text-[13px] text-dusk-50/90 leading-relaxed whitespace-pre-wrap line-clamp-[10] flex-1 pt-0.5 italic">
                          {photo.note}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-dusk-100/55 font-mono tracking-[0.04em]">
                        <MapPin className="w-2.5 h-2.5 text-amber/70" aria-hidden="true" />
                        {photo.city_name}
                      </div>
                    </button>
                    {onDeletePhoto && (
                      <button
                        type="button"
                        aria-label={`删除记录：${photo.city_name}`}
                        onClick={() => setDeleteTarget(photo)}
                        className="absolute top-1 right-1 w-11 h-11 rounded-lg bg-black/30 backdrop-blur-md flex items-center justify-center transition-colors duration-200 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 hover:bg-red-500/60 active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              )
            }

            return (
              <div
                key={photo.id}
                className="break-inside-avoid relative group"
              >
                <button
                  type="button"
                  aria-label={`查看记录：${photo.note || photo.city_name}`}
                  onClick={() => onPhotoClick(photo)}
                  className="block w-full rounded-[6px] overflow-hidden relative aspect-[4/3] bg-dusk-600/30 border border-dusk-300/20 hover-lift text-left"
                >
                  <img
                    src={photo.image_url}
                    alt={photo.note || photo.city_name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'rgba(196, 115, 90, 0.06)' }}
                    aria-hidden="true"
                  />
                </button>
                {onDeletePhoto && (
                  <button
                    type="button"
                    aria-label={`删除记录：${photo.city_name}`}
                    onClick={() => setDeleteTarget(photo)}
                    className="absolute top-1 right-1 w-11 h-11 rounded-[6px] bg-black/35 backdrop-blur-md flex items-center justify-center transition-all duration-200 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 hover:bg-red-500/60 active:scale-90"
                  >
                    <Trash2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </button>
                )}
                {photo.note ? (
                  <p className="text-[11px] text-dusk-100/75 text-center leading-relaxed line-clamp-2 font-medium italic px-1 mt-2 mb-1 font-serif">
                    {photo.note}
                  </p>
                ) : (
                  <p className="text-[11px] text-dusk-100/45 text-center tracking-[0.04em] mt-2 mb-1 font-mono">
                    {photo.city_name}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="删除照片"
          message={deleteTarget.note
            ? `确定要删除「${deleteTarget.note}」这张照片吗？`
            : '确定要删除这张照片吗？'
          }
          confirmLabel="确认删除"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  )
}
