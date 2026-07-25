import { useState } from 'react'
import type { Photo } from '../../types'
import { Camera, Trash2, MapPin } from 'lucide-react'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (photo: Photo) => void
  onDeletePhoto?: (id: string) => Promise<void>
}

const ROW_SPANS = [40, 32, 48, 36, 44, 38] as const
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
      <div className="mx-7 py-16 text-center animate-fade-in-up">
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
      <div className="mx-7">
        {/* 章节式标题 */}
        <div className="flex items-center gap-3 mb-5">
          <span className="editorial-chapter">II</span>
          <h3 className="font-serif text-[15px] font-semibold text-dusk-50 tracking-[0.05em]">
            回忆碎片
          </h3>
          <span className="font-mono text-[11px] text-amber/70 tabular-nums">{photos.length}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-amber/35 to-transparent" />
        </div>

        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gridAutoRows: '4px',
          }}
        >
          {photos.map((photo, i) => {
            const rowSpan = ROW_SPANS[i % ROW_SPANS.length]

            if (photo.entry_type === 'note' || !photo.image_url) {
              const stickyClass = STICKY_COLORS[i % STICKY_COLORS.length]
              return (
                <div
                  key={photo.id}
                  className="break-inside-avoid animate-fade-in-up"
                  style={{
                    gridRow: `span ${rowSpan}`,
                    animationDelay: `${i * 0.05}s`,
                    opacity: 0,
                  }}
                >
                  <div
                    className={`glass-card ${stickyClass} p-4 cursor-pointer active:brightness-95 transition-all duration-300 relative hover-lift`}
                    style={{ transform: `rotate(${(i % 2 === 0 ? -0.8 : 0.8)}deg)` }}
                    onClick={() => onPhotoClick(photo)}
                  >
                    {/* 装订孔 */}
                    <span
                      className="absolute top-3 left-1.5 w-[3px] h-[3px] rounded-full bg-amber/40"
                      aria-hidden="true"
                    />
                    <div className="flex items-start gap-1.5 mb-2">
                      <span className="font-serif text-xl text-amber/65 leading-none -mt-1">"</span>
                      <p className="text-[13px] text-dusk-50/90 leading-relaxed whitespace-pre-wrap line-clamp-[10] flex-1 pt-0.5 italic">
                        {photo.note}
                      </p>
                    </div>
                    {onDeletePhoto && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(photo) }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/30 backdrop-blur-md flex items-center justify-center transition-colors duration-200 max-sm:opacity-100 sm:opacity-0 sm:hover:opacity-100 hover:bg-red-500/60 active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                    {/* 城市戳 */}
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-dusk-100/55 font-mono tracking-[0.04em]">
                      <MapPin className="w-2.5 h-2.5 text-amber/70" />
                      {photo.city_name}
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={photo.id}
                className="break-inside-avoid"
                style={{
                  gridRow: `span ${rowSpan}`,
                }}
              >
                <div
                  className="rounded-[6px] overflow-hidden relative cursor-pointer group bg-dusk-600/30 border border-dusk-300/20 hover-lift"
                  style={{ height: '100%' }}
                  onClick={() => onPhotoClick(photo)}
                >
                  {photo.image_url ? (
                    <img
                      src={photo.image_url}
                      alt={photo.note || photo.city_name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full img-skeleton flex items-center justify-center">
                      <span className="text-[11px] text-dusk-100/40">加载中</span>
                    </div>
                  )}
                  {/* 顶部渐变遮罩 — hover 时显示 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {onDeletePhoto && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(photo) }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-[6px] bg-black/35 backdrop-blur-md flex items-center justify-center transition-all duration-200 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-500/60 active:scale-90"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                  {/* 暖色叠加 */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'rgba(196, 115, 90, 0.06)' }}
                    aria-hidden="true"
                  />
                </div>
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
