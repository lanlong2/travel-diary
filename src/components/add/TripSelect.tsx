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
    <div className="mx-6">
      <label className="block text-sm font-medium text-dusk-100/80 mb-3 tracking-wide">
        旅行
        {selectedTripId && trips.find(t => t.id === selectedTripId) && (
          <span className="ml-2 text-xs font-normal text-dusk-100/45">已选择</span>
        )}
      </label>

      <div className="space-y-2.5 mb-3 max-h-56 overflow-y-auto scrollbar-hide">
        {trips.map((trip) => {
          const isSelected = selectedTripId === trip.id
          return (
            <button
              key={trip.id}
              onClick={() => onSelectTrip(trip.id)}
              className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'border-amber/50 bg-amber/10'
                  : 'border-dusk-300/20 bg-dusk-600/30 hover:border-dusk-300/40 hover:bg-dusk-600/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {isSelected ? (
                    <div className="w-9 h-9 rounded-xl bg-amber/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-amber" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-dusk-100/50" />
                    </div>
                  )}
                  <span className="font-serif font-semibold text-base text-dusk-50 truncate tracking-wide">{trip.title}</span>
                </div>
                <span className="text-xs text-dusk-100/50 flex-shrink-0 ml-2 font-mono tracking-wider">
                  {trip.cities?.length || 0} 城
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {showNew ? (
        <div className="p-5 glass-card animate-scale-in">
          <p className="text-sm text-dusk-50 mb-3 font-medium tracking-wide">创建新旅行</p>
          <div className="flex gap-2.5">
            <div className="flex-1">
              <Input
                placeholder="旅行标题（如：川西环线）"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
          </div>
          <div className="flex gap-2.5 mt-2.5">
            <div className="flex-1">
              <label className="block text-xs font-medium text-dusk-100/60 mb-1.5 tracking-wide">开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-dusk-600/40 border border-dusk-300/30 rounded-2xl text-sm text-dusk-50 focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/60 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-dusk-100/60 mb-1.5 tracking-wide">结���日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-dusk-600/40 border border-dusk-300/30 rounded-2xl text-sm text-dusk-50 focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/60 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2.5 mt-3">
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="px-6 py-3 bg-gradient-to-br from-amber to-caramel-700 text-white rounded-2xl text-sm font-semibold disabled:opacity-40 transition-opacity flex-shrink-0 tracking-wide active:scale-95"
            >
              创建
            </button>
            <button
              onClick={() => { setShowNew(false); setNewTitle('') }}
              className="px-4 py-3 text-dusk-100/60 text-sm flex-shrink-0 hover:text-dusk-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full py-5 border-2 border-dashed border-dusk-300/40 rounded-2xl text-sm text-dusk-100/60 hover:border-amber/50 hover:text-amber transition-all flex items-center justify-center gap-2 hover:bg-amber/5 tracking-wide"
        >
          <div className="w-7 h-7 rounded-lg bg-amber/12 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          新建旅行
        </button>
      )}
    </div>
  )
}
