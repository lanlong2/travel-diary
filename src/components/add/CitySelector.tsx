import { useState, useRef, useEffect } from 'react'
import { loadAMap } from '../../lib/amap'
import { Search, MapPin, Navigation, X } from 'lucide-react'
import { Input } from '../ui/Input'

interface SelectedCity {
  name: string
  lat: number
  lng: number
}

interface CitySelectorProps {
  onCitySelect: (city: SelectedCity | null) => void
  selectedCity: SelectedCity | null
}

export function CitySelector({ onCitySelect, selectedCity }: CitySelectorProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SelectedCity[]>([])
  const [locating, setLocating] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const searchCity = async (keyword: string) => {
    if (!keyword.trim()) { setSuggestions([]); return }
    try {
      const AMap = await loadAMap()
      AMap.plugin('AMap.AutoComplete', () => {
        const auto = new AMap.AutoComplete({ citylimit: false })
        auto.search(keyword, (_status: string, result: { tips: { name: string; location: { lat: number; lng: number } }[] }) => {
          if (result?.tips) {
            const cities = result.tips
              .filter((t) => t.location)
              .map((t) => ({ name: t.name, lat: t.location.lat, lng: t.location.lng }))
            setSuggestions(cities)
          }
        })
      })
    } catch { /* ignore */ }
  }

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => searchCity(query), 400)
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [query])

  const locateMe = () => {
    setLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          try {
            const AMap = await loadAMap()
            AMap.plugin('AMap.Geocoder', () => {
              const geocoder = new AMap.Geocoder()
              geocoder.getAddress([longitude, latitude], (_status: string, result: { regeocode: { addressComponent: { city: string } } }) => {
                const cityName = (result.regeocode.addressComponent.city || '未知城市').replace('市', '')
                onCitySelect({ name: cityName, lat: latitude, lng: longitude })
                setLocating(false)
              })
            })
          } catch { setLocating(false) }
        },
        () => setLocating(false)
      )
    }
  }

  return (
    <div className="mx-6">
      <label className="block text-sm font-semibold text-warm-700 mb-3">
        🗺️ 城市
        {selectedCity && (
          <span className="ml-2 text-xs font-normal text-warm-400">（点击更改）</span>
        )}
      </label>

      {selectedCity ? (
        <div className="relative p-5 bg-white rounded-2xl border-2 border-warm-500/30 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-10 w-14 h-5 bg-warm-400/20 -rotate-6 rounded-sm blur-[0.5px]" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-warm-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-caramel" />
              </div>
              <span className="font-bold text-base text-warm-900">{selectedCity.name}</span>
            </div>
            <button
              onClick={() => onCitySelect(null)}
              className="w-9 h-9 rounded-full bg-warm-100 flex items-center justify-center hover:bg-warm-200 transition-colors"
            >
              <X className="w-5 h-5 text-warm-400" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2.5">
            <div className="flex-1">
              <Input icon={Search} placeholder="搜索城市名..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button
              onClick={locateMe}
              disabled={locating}
              className="relative px-5 bg-white border border-warm-300 rounded-2xl text-warm-500 hover:bg-warm-50 hover:border-warm-400 transition-all disabled:opacity-60 flex-shrink-0 group"
              title="自动定位"
            >
              <Navigation className={`w-6 h-6 ${locating ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
              {locating && (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-warm-400 whitespace-nowrap">定位中...</span>
              )}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-2 bg-white rounded-2xl border border-warm-200/80 overflow-hidden shadow-lg shadow-warm-900/5 max-h-56 overflow-y-auto animate-scale-in">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { onCitySelect(s); setQuery(''); setSuggestions([]) }}
                  className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-warm-50 transition-colors border-b border-warm-50 last:border-0"
                >
                  <span className="w-8 h-8 rounded-lg bg-warm-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-warm-500" />
                  </span>
                  <span className="text-sm text-warm-800 font-medium">{s.name}</span>
                </button>
              ))}
            </div>
          )}

          {query && suggestions.length === 0 && (
            <p className="mt-2 text-center text-xs text-warm-300 py-3">未找到匹配的城市</p>
          )}
        </>
      )}
    </div>
  )
}
