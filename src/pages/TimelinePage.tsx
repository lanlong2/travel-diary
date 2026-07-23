import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { MonthDivider } from '../components/timeline/MonthDivider'
import { TimelineCard } from '../components/timeline/TimelineCard'
import { usePhotos } from '../hooks/usePhotos'
import { useTrips } from '../hooks/useTrips'
import { Spinner } from '../components/ui/Spinner'
import { ScrollText } from 'lucide-react'
import type { Photo } from '../types'

export function TimelinePage() {
  const navigate = useNavigate()
  const { photos, loading } = usePhotos()
  const { trips } = useTrips()

  const groupedByMonth = useMemo(() => {
    const groups: { month: string; records: Photo[] }[] = []
    const monthMap = new Map<string, Photo[]>()

    photos.forEach((p) => {
      const d = new Date(p.record_date || p.created_at)
      const key = `${d.getFullYear()}年${d.getMonth() + 1}月`
      const arr = monthMap.get(key)
      if (arr) arr.push(p)
      else monthMap.set(key, [p])
    })

    const sortedKeys = Array.from(monthMap.keys()).sort((a, b) => {
      const [ya, ma] = a.replace('年', ' ').split(' ').map(Number)
      const [yb, mb] = b.replace('年', ' ').split(' ').map(Number)
      return yb - ya || mb - ma
    })

    sortedKeys.forEach((key) => {
      groups.push({ month: key, records: monthMap.get(key)! })
    })

    return groups
  }, [photos])

  if (loading) {
    return (
      <PageShell>
        <Spinner className="min-h-screen" />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="px-7 pt-8 pb-2">
        {/* 顶部章节标识 */}
        <div className="flex items-center gap-3 mb-3">
          <span className="editorial-chapter">CHAPTER · II</span>
          <span className="flex-1 h-px bg-gradient-to-r from-amber/40 to-transparent" />
        </div>

        <h1 className="display-hero text-[28px] text-dusk-50 tracking-[0.04em] animate-fade-in-down flex items-center gap-3">
          <ScrollText className="w-6 h-6 text-amber" />
          <span className="italic">Diary</span>
          <span className="font-serif text-[14px] text-dusk-100/60 not-italic font-normal tracking-[0.15em]">时光日记</span>
        </h1>
        <p className="text-[11px] text-dusk-100/55 mt-2 tracking-[0.05em] font-mono">
          {photos.length} 条记录 · 共 {groupedByMonth.length} 个月份
        </p>
      </div>

      {photos.length === 0 ? (
        <div className="relative mx-7 mt-8 mb-8 py-10">
          <div
            className="absolute left-[18px] top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(180deg, transparent, oklch(58% 0.13 40 / 0.2), transparent)' }}
            aria-hidden="true"
          />
          <div className="flex flex-col items-start pl-[36px]">
            <div className="w-12 h-12 rounded-full bg-amber/15 border-2 border-amber/30 flex items-center justify-center animate-breathe">
              <ScrollText className="w-5 h-5 text-amber/75" />
            </div>
            <p className="mt-4 text-[13px] text-dusk-100/55 tracking-[0.04em] font-serif italic">
              时光的扉页 · 等待第一笔
            </p>
          </div>
        </div>
      ) : (
        <div className="timeline-spine relative py-2">
          {groupedByMonth.map((group) => (
            <div key={group.month}>
              <MonthDivider label={group.month} />
              {group.records.map((record, i) => (
                <TimelineCard
                  key={record.id}
                  record={record}
                  index={i}
                  isFirstInMonth={i === 0}
                  onClick={() => {
                    const trip = trips.find((t) => t.id === record.trip_id)
                    if (trip) navigate(`/trip/${trip.id}`)
                  }}
                />
              ))}
            </div>
          ))}
          <div className="h-8" />
        </div>
      )}
    </PageShell>
  )
}
