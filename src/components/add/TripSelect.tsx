import { useState } from 'react'
import { Plus, Check, BookOpen } from 'lucide-react'
import { Input } from '../ui/Input'
import type { Trip, TripCity } from '../../types'

interface TripSelectProps {
  trips: (Trip & { cities: TripCity[] })[]
  selectedTripId: string | null
  onSelectTrip: (id: string) => void
  onCreateTrip: (title: string, startDate: string, endDate: string) => void
}

export function TripSelect({ trips, selectedTripId, onSelectTrip, onCreateTrip }: TripSelectProps) {
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const handleCreate = () => {
    if (newTitle.trim()) {
      onCreateTrip(newTitle.trim(), startDate, endDate)
      setNewTitle('')
      setShowNew(false)
    }
  }

  return (
    <div className="page-mx">
      <label className="block text-[13px] font-medium text-dusk-100/80 mb-3 tracking-[0.04em] flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-amber/60" />
        旅行
        {selectedTripId && trips.find(t => t.id === selectedTripId) && (
          <span className="ml-2 text-[11px] font-normal text-amber/70">已选择</span>
        )}
      </label>

      <div className="space-y-2.5 mb-3 max-h-56 overflow-y-auto scrollbar-hide">
        {trips.map((trip) => {
          const isSelected = selectedTripId === trip.id
          return (
            <button
              key={trip.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectTrip(trip.id)}
              className={`w-full p-4 rounded-[14px] border text-left transition-all duration-200 active:scale-[0.99] ${
                isSelected
                  ? 'border-amber/55 bg-amber/12 shadow-[0_4px_16px_oklch(68%_0.17_40_/_0.12)]'
                  : 'border-dusk-300/20 bg-dusk-600/30 hover:border-dusk-300/45 hover:bg-dusk-600/55'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {isSelected ? (
                    <div className="w-9 h-9 rounded-[10px] bg-amber/15 border border-amber/25 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-amber" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-[10px] bg-white/8 border border-dusk-300/15 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-dusk-100/55" />
                    </div>
                  )}
                  <span className="font-serif font-semibold text-[15px] text-dusk-50 truncate tracking-[0.04em]">{trip.title}</span>
                </div>
                <span className="text-[11px] text-dusk-100/55 flex-shrink-0 ml-2 font-mono tracking-[0.04em]">
                  {trip.cities?.length || 0} 城
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {showNew ? (
        <div className="p-5 glass-card animate-scale-in relative">
          {/* 顶部折光线 */}
          <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent" />
          <p className="text-[13px] text-dusk-50 mb-3 font-medium tracking-[0.04em] flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-amber" />
            新建旅行
          </p>
          <div className="flex gap-2.5">
            <div className="flex-1">
              <Input
                label="旅行标题"
                placeholder="例如：杭州周末"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2.5 mt-2.5 sm:grid-cols-2">
            <div className="flex-1">
              <label htmlFor="new-trip-start" className="block text-[11px] font-medium text-dusk-100/65 mb-1.5 tracking-[0.04em]">开始</label>
              <input
                id="new-trip-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-dusk-600/40 border border-dusk-300/30 rounded-[12px] text-[13px] text-dusk-50 focus:outline-none focus:ring-[1px] focus:ring-amber/30 focus:border-amber/55 transition-colors"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="new-trip-end" className="block text-[11px] font-medium text-dusk-100/65 mb-1.5 tracking-[0.04em]">结束</label>
              <input
                id="new-trip-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-dusk-600/40 border border-dusk-300/30 rounded-[12px] text-[13px] text-dusk-50 focus:outline-none focus:ring-[1px] focus:ring-amber/30 focus:border-amber/55 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2.5 mt-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="px-6 py-3 bg-gradient-to-br from-amber via-amber to-amber-ember text-white rounded-[14px] text-[13px] font-semibold disabled:opacity-40 transition-opacity flex-shrink-0 tracking-[0.04em] active:brightness-95 active:scale-95 duration-200 edge-glow-amber"
            >
              创建
            </button>
            <button
              type="button"
              onClick={() => { setShowNew(false); setNewTitle('') }}
              className="px-4 py-3 text-dusk-100/65 text-[13px] flex-shrink-0 hover:text-dusk-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="w-full py-5 border border-dashed border-dusk-300/40 rounded-[14px] text-[13px] text-dusk-100/65 hover:border-amber/55 hover:text-amber transition-colors flex items-center justify-center gap-2 hover:bg-amber/5 tracking-[0.04em] active:scale-[0.99] duration-200"
        >
          <div className="w-7 h-7 rounded-[8px] bg-amber/12 border border-amber/20 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          新建旅行
        </button>
      )}
    </div>
  )
}
