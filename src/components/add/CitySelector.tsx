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
    <div className="mx-7">
      <label className="block text-[13px] font-medium text-dusk-100/80 mb-3 tracking-[0.04em] flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-amber/60" />
        城市
        {selectedCity && (
          <span className="ml-2 text-[11px] font-normal text-amber/70">已选择 · 点击更改</span>
        )}
      </label>

      {selectedCity ? (
        <div className="relative p-5 glass-card border-l-2 border-amber overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[12px] bg-amber/15 border border-amber/25 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-amber" />
              </div>
              <div>
                <span className="font-serif font-semibold text-[15px] text-dusk-50 tracking-[0.04em] block">
                  {selectedCity.name}
                </span>
                <span className="font-mono text-[10px] text-dusk-100/45 tracking-[0.04em]">
                  {selectedCity.lat.toFixed(3)}, {selectedCity.lng.toFixed(3)}
                </span>
              </div>
            </div>
            <button
              onClick={() => onCitySelect(null)}
              className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-red-500/30 transition-colors active:scale-90 duration-200"
              aria-label="清除"
            >
              <X className="w-5 h-5 text-dusk-100/70" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2.5">
            <div className="flex-1">
              <Input icon={Search} placeholder="搜索城市" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button
              onClick={locateMe}
              disabled={locating}
              className="relative glass-nav rounded-[14px] text-amber hover:bg-white/10 transition-colors disabled:opacity-60 flex-shrink-0 group px-5 active:scale-95 duration-200"
              aria-label="自动定位"
            >
              <Navigation className={`w-6 h-6 ${locating ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-2 glass-card overflow-hidden max-h-56 overflow-y-auto scrollbar-hide animate-scale-in">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { onCitySelect(s); setQuery(''); setSuggestions([]) }}
                  className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-white/8 transition-colors border-b border-dusk-300/15 last:border-0 active:bg-white/12"
                >
                  <span className="w-8 h-8 rounded-[8px] bg-amber/12 border border-amber/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-amber" />
                  </span>
                  <span className="text-[13px] text-dusk-50 font-medium tracking-[0.04em]">{s.name}</span>
                </button>
              ))}
            </div>
          )}

          {query && suggestions.length === 0 && (
            <p className="mt-2 text-center text-[11px] text-dusk-100/40 py-3 tracking-[0.04em]">未找到匹配的城市</p>
          )}
        </>
      )}
    </div>
  )
}
