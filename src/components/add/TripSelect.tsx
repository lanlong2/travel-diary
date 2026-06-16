import { useState } from 'react'
import { Plus, Check, BookOpen } from 'lucide-react'
import { Input } from '../ui/Input'
import type { Trip, TripCity } from '../../types'

interface TripSelectProps {
  trips: (Trip & { cities: TripCity[] })[]
  selectedTripId: string | null
  onSelectTrip: (id: string) => void
  onCreateTrip: (title: string) => void
}

export function TripSelect({ trips, selectedTripId, onSelectTrip, onCreateTrip }: TripSelectProps) {
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const handleCreate = () => {
    if (newTitle.trim()) {
      onCreateTrip(newTitle.trim())
      setNewTitle('')
      setShowNew(false)
    }
  }

  return (
    <div className="mx-6">
      <label className="block text-sm font-semibold text-warm-700 mb-3">
        📖 旅行
        {selectedTripId && trips.find(t => t.id === selectedTripId) && (
          <span className="ml-2 text-xs font-normal text-warm-400">（已选择）</span>
        )}
      </label>

      <div className="space-y-2.5 mb-3 max-h-56 overflow-y-auto scrollbar-hide">
        {trips.map((trip) => {
          const isSelected = selectedTripId === trip.id
          return (
            <button
              key={trip.id}
              onClick={() => onSelectTrip(trip.id)}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-caramel/50 bg-warm-50 shadow-sm'
                  : 'border-warm-200/60 bg-white hover:border-warm-300 hover:bg-warm-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {isSelected ? (
                    <div className="w-9 h-9 rounded-xl bg-caramel/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-caramel" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-warm-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-warm-400" />
                    </div>
                  )}
                  <span className="font-semibold text-base text-warm-900 truncate">{trip.title}</span>
                </div>
                <span className="text-xs text-warm-400/80 flex-shrink-0 ml-2">
                  {trip.cities?.length || 0} 城
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {showNew ? (
        <div className="p-5 bg-warm-50/80 rounded-2xl border border-warm-200/60 animate-scale-in">
          <p className="text-sm text-warm-500 mb-3 font-medium">创建新旅行</p>
          <div className="flex gap-2.5">
            <div className="flex-1">
              <Input
                placeholder="旅行标题（如：川西环线）"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="px-6 py-3 bg-warm-500 text-white rounded-2xl text-sm font-bold disabled:opacity-40 transition-opacity flex-shrink-0"
            >
              创建
            </button>
            <button
              onClick={() => { setShowNew(false); setNewTitle('') }}
              className="px-4 py-3 text-warm-400 text-sm flex-shrink-0 hover:text-warm-600 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full py-5 border-2 border-dashed border-warm-300/70 rounded-2xl text-base text-warm-400 hover:border-warm-500/60 hover:text-warm-500 transition-all flex items-center justify-center gap-2 hover:bg-warm-50/30"
        >
          <div className="w-7 h-7 rounded-lg bg-warm-100 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          新建旅行
        </button>
      )}
    </div>
  )
}
