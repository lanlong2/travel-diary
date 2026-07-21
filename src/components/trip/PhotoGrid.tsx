import { useState } from 'react'
import type { Photo } from '../../types'
import { Camera, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (photo: Photo) => void
  onDeletePhoto?: (id: string) => Promise<void>
}

const ASPECTS = ['3/4', '4/3', '1/1', '3/4', '4/3'] as const
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
      <div className="mx-6 py-16 text-center animate-fade-in-up">
        {/* 旋转装饰环 + 相机 */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <span
            className="absolute inset-0 rounded-full border border-amber/30 border-dashed animate-rotate-halo"
            style={{ animationDuration: '10s' }}
            aria-hidden="true"
          />
          <span
            className="absolute inset-2 rounded-full border border-amber/20 animate-rotate-halo"
            style={{ animationDuration: '8s', animationDirection: 'reverse' }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-7 h-7 text-amber/60 animate-breathe" />
          </div>
        </div>
        <p className="text-sm text-dusk-50 font-medium tracking-wide">还没有记录</p>
        <p className="text-xs text-dusk-100/45 mt-2">记录属于我们的每一刻</p>
      </div>
    )
  }

  return (
    <>
      <div className="mx-6">
        <div className="flex items-center gap-2.5 mb-5">
          <h3 className="font-serif text-[15px] font-semibold text-dusk-50 tracking-[0.15em]">
            回忆碎片
          </h3>
          <span className="text-[11px] text-dusk-100/60 font-mono bg-white/8 px-2.5 py-0.5 rounded-full tracking-wider">
            {photos.length}
          </span>
        </div>

        {/* 瀑布流错落布局 */}
        <div
          className="gap-3"
          style={{ columnCount: 2, columnGap: '12px' }}
        >
          {photos.map((photo, i) => {
            if (photo.entry_type === 'note' || !photo.image_url) {
              const stickyClass = STICKY_COLORS[i % STICKY_COLORS.length]
              return (
                <div
                  key={photo.id}
                  className="mb-3 break-inside-avoid animate-fade-in-up animate-sticker-peel"
                  style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
                >
                  <div
                    className={`glass-card ${stickyClass} p-4 cursor-pointer active:scale-[0.98] transition-transform duration-150 relative`}
                    style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 0.6}deg)` }}
                    onClick={() => onPhotoClick(photo)}
                  >
                    <div className="flex items-start gap-1.5 mb-2">
                      <span className="font-serif text-xl text-amber/60 leading-none">"</span>
                      <p className="text-sm text-dusk-50/90 leading-relaxed whitespace-pre-wrap line-clamp-[10] flex-1 pt-0.5">
                        {photo.note}
                      </p>
                    </div>
                    {onDeletePhoto && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(photo) }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/30 backdrop-blur-md flex items-center justify-center transition-all duration-200 sm:opacity-0 sm:hover:opacity-100 max-sm:opacity-100 hover:bg-red-500/60"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              )
            }

            const aspect = ASPECTS[i % ASPECTS.length]

            return (
              <div
                key={photo.id}
                className="mb-3 break-inside-avoid animate-fade-in-up animate-sticker-peel"
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
              >
                <div
                  className="glass-card overflow-hidden relative cursor-pointer group"
                  style={{ aspectRatio: aspect }}
                  onClick={() => onPhotoClick(photo)}
                >
                  <img
                    src={photo.image_url}
                    alt={photo.note || photo.city_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-105"
                    loading="lazy"
                  />
                  {onDeletePhoto && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(photo) }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 max-sm:opacity-100 hover:bg-red-500/60"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                {photo.note ? (
                  <p className="text-xs text-dusk-100/70 text-center leading-relaxed line-clamp-2 font-medium italic px-1 mt-2 mb-1">
                    {photo.note}
                  </p>
                ) : (
                  <p className="text-[11px] text-dusk-100/40 text-center tracking-wide mt-2 mb-1">
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
