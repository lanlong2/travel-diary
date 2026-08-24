import { useEffect, useState } from 'react'
import type { Photo } from '../../types'
import { Camera, MapPin, RefreshCw, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { reportPrivatePhotoLoadError } from '../../lib/privatePhotoEvents'

interface PhotoGridProps {
  photos: Photo[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void | Promise<void>
  onPhotoClick: (photo: Photo) => void
  onDeletePhoto?: (id: string) => Promise<void>
}

const STICKY_COLORS = ['sticky-yellow', 'sticky-pink', 'sticky-blue', 'sticky-green'] as const

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '操作失败，请稍后重试'
}

function SectionHeading({ count }: { count?: number }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="editorial-chapter">II</span>
      <h3 className="font-serif text-[15px] font-semibold text-dusk-50 tracking-[0.05em]">
        回忆碎片
      </h3>
      <span className="font-mono text-[11px] text-amber/70 tabular-nums">{count ?? '—'}</span>
      <span className="flex-1 h-px bg-gradient-to-r from-amber/35 to-transparent" />
    </div>
  )
}

function PhotoImage({ photo, eager = false }: { photo: Photo; eager?: boolean }) {
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [photo.image_url])

  if (imageError) {
    return (
      <div
        role="img"
        aria-label={`${photo.city_name}的照片暂时无法显示`}
        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-dusk-950/55 text-dusk-100/50"
      >
        <Camera className="h-7 w-7" aria-hidden="true" />
        <span className="text-[11px] tracking-[0.04em]">照片暂时无法显示</span>
      </div>
    )
  }

  return (
    <img
      src={photo.image_url ?? undefined}
      alt={photo.note || photo.city_name}
      className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => {
        if (photo.image_url) reportPrivatePhotoLoadError(photo.image_url)
        setImageError(true)
      }}
    />
  )
}

function DeleteButton({ photo, onDelete }: { photo: Photo; onDelete: () => void }) {
  return (
    <button
      type="button"
      aria-label={`删除记录：${photo.city_name}`}
      onClick={(event) => {
        event.stopPropagation()
        onDelete()
      }}
      className="absolute top-1 right-1 z-10 flex h-11 w-11 items-center justify-center rounded-[6px] bg-black/35 backdrop-blur-md transition-all duration-200 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 hover:bg-red-500/60 active:scale-90"
    >
      <Trash2 className="h-4 w-4 text-white" aria-hidden="true" />
    </button>
  )
}

function PhotoCard({
  photo,
  index,
  onPhotoClick,
  onDelete,
}: {
  photo: Photo
  index: number
  onPhotoClick: (photo: Photo) => void
  onDelete?: (photo: Photo) => void
}) {
  const isNote = photo.entry_type === 'note' || !photo.image_url

  if (isNote) {
    const stickyClass = STICKY_COLORS[index % STICKY_COLORS.length]

    return (
      <div
        className="break-inside-avoid relative group animate-fade-in-up"
        style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
      >
        <div
          className={`glass-card ${stickyClass} relative overflow-hidden hover-lift`}
          style={{ transform: `rotate(${index % 2 === 0 ? -0.8 : 0.8}deg)` }}
        >
          <button
            type="button"
            aria-label={`查看记录：${photo.city_name}`}
            onClick={() => onPhotoClick(photo)}
            className="block w-full p-4 pr-12 text-left active:brightness-95 transition-all duration-300"
          >
            <span
              className="absolute top-3 left-1.5 h-[3px] w-[3px] rounded-full bg-amber/40"
              aria-hidden="true"
            />
            <div className="mb-2 flex items-start gap-1.5">
              <span
                className="-mt-1 font-serif text-xl leading-none text-amber/65"
                aria-hidden="true"
              >
                &quot;
              </span>
              <p className="line-clamp-[10] flex-1 whitespace-pre-wrap pt-0.5 font-serif text-[13px] italic leading-relaxed text-dusk-50/90">
                {photo.note}
              </p>
            </div>
            <div className="mt-2 flex items-center gap-1 font-mono text-[10px] tracking-[0.04em] text-dusk-100/55">
              <MapPin className="h-2.5 w-2.5 text-amber/70" aria-hidden="true" />
              {photo.city_name}
            </div>
          </button>
          {onDelete && <DeleteButton photo={photo} onDelete={() => onDelete(photo)} />}
        </div>
      </div>
    )
  }

  return (
    <div className="break-inside-avoid relative group">
      <button
        type="button"
        aria-label={`查看记录：${photo.note || photo.city_name}`}
        onClick={() => onPhotoClick(photo)}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-[6px] border border-dusk-300/20 bg-dusk-950/45 text-left hover-lift"
      >
        <PhotoImage photo={photo} eager={index < 2} />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'rgba(196, 115, 90, 0.06)' }}
          aria-hidden="true"
        />
      </button>
      {onDelete && <DeleteButton photo={photo} onDelete={() => onDelete(photo)} />}
      {photo.note ? (
        <p className="mt-2 mb-1 line-clamp-2 px-1 text-center font-serif text-[11px] font-medium italic leading-relaxed text-dusk-100/75">
          {photo.note}
        </p>
      ) : (
        <p className="mt-2 mb-1 text-center font-mono text-[11px] tracking-[0.04em] text-dusk-100/45">
          {photo.city_name}
        </p>
      )}
    </div>
  )
}

function PhotoGridSkeleton() {
  return (
    <div className="page-mx" aria-busy="true" aria-label="正在加载照片">
      <SectionHeading />
      <div className="photo-grid">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="break-inside-avoid animate-pulse">
            <div
              className={`rounded-[6px] bg-dusk-600/45 ${item % 2 === 0 ? 'aspect-[4/3]' : 'h-40'}`}
            />
            <div className="mx-auto mt-3 h-2.5 w-2/3 rounded-full bg-dusk-600/35" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PhotoGrid({
  photos,
  loading = false,
  error = null,
  onRetry,
  onPhotoClick,
  onDeletePhoto,
}: PhotoGridProps) {
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget || !onDeletePhoto) return

    setDeleting(true)
    setDeleteError(null)
    try {
      await onDeletePhoto(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PhotoGridSkeleton />

  if (error) {
    return (
      <div className="page-mx py-16 text-center animate-fade-in-up" role="alert">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-400/20 bg-red-500/10">
          <Camera className="h-7 w-7 text-red-300/75" />
        </div>
        <p className="text-[13px] font-medium tracking-[0.04em] text-dusk-50/85">照片加载失败</p>
        <p className="mx-auto mt-2 max-w-sm text-[11px] leading-5 text-dusk-100/50">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={() => void onRetry()}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-4 py-2 text-[12px] font-medium text-amber transition-colors hover:bg-amber/20 active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            重新加载
          </button>
        )}
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="page-mx py-16 text-center animate-fade-in-up">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-amber/20 bg-amber/10">
          <Camera className="h-7 w-7 text-amber/60" />
        </div>
        <p className="text-[13px] font-medium tracking-[0.04em] text-dusk-50/80">还没有记录</p>
        <p className="mt-2 text-[11px] tracking-[0.04em] text-dusk-100/45">添加第一条记录</p>
      </div>
    )
  }

  return (
    <>
      <div className="page-mx">
        <SectionHeading count={photos.length} />

        <div className="photo-grid">
          {photos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              index={index}
              onPhotoClick={onPhotoClick}
              onDelete={
                onDeletePhoto
                  ? (target) => {
                      setDeleteError(null)
                      setDeleteTarget(target)
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="删除照片"
          message={
            deleteError
              ? `删除失败：${deleteError}`
              : deleteTarget.note
                ? `确定要删除「${deleteTarget.note}」这张照片吗？`
                : '确定要删除这张照片吗？'
          }
          confirmLabel={deleteError ? '重试删除' : '确认删除'}
          onConfirm={handleDelete}
          onCancel={() => {
            setDeleteTarget(null)
            setDeleteError(null)
          }}
          loading={deleting}
        />
      )}
    </>
  )
}
