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
      <div className="px-6 pt-8 pb-2">
        <h1 className="flex items-center gap-2.5 font-serif text-2xl font-bold text-dusk-50 tracking-[0.15em]">
          <ScrollText className="w-6 h-6 text-amber" />
          时光日记
        </h1>
        <p className="text-xs text-dusk-100/50 mt-2 tracking-wider font-mono">
          {photos.length} 条记录
        </p>
      </div>

      {photos.length === 0 ? (
        <div className="relative mx-6 mt-8 mb-8 py-10">
          {/* 空时间线竖线 */}
          <div
            className="absolute left-[18px] top-0 bottom-0 w-[1.5px]"
            style={{
              background:
                'repeating-linear-gradient(to bottom, oklch(68% 0.17 40 / 0.35) 0, oklch(68% 0.17 40 / 0.35) 6px, transparent 6px, transparent 12px)',
            }}
            aria-hidden="true"
          />
          {/* 起点爱心 */}
          <div className="flex flex-col items-start pl-[36px]">
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-amber/20 to-caramel/20 border border-amber/40 flex items-center justify-center animate-breathe"
              style={{ boxShadow: '0 0 24px oklch(68% 0.17 40 / 0.35)' }}
            >
              <ScrollText className="w-5 h-5 text-amber" />
            </div>
            <p className="font-serif text-base text-dusk-50 tracking-wide mt-6 leading-relaxed">
              时间线还空着
            </p>
            <p className="text-xs text-dusk-100/55 mt-2 leading-relaxed max-w-[260px]">
              去记录属于你们的第一个瞬间吧
              <span className="inline-block ml-1 animate-float-soft" style={{ animationDuration: '2s' }}>
                ↓
              </span>
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
