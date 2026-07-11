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
        <div className="mx-6 mt-8 glass-card p-12 text-center">
          <p className="font-serif text-base text-dusk-50 tracking-wide mb-2">还没有记录</p>
          <p className="text-xs text-dusk-100/55 mt-3">
            点击底部「记录」按钮写下第一条
          </p>
        </div>
      ) : (
        <div className="py-2">
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
