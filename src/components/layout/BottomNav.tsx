import { useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Map, PlusCircle, Compass, ScrollText } from 'lucide-react'

type TabItem = { path: string; icon: typeof Map; label: string; isFab?: boolean }
const TABS: TabItem[] = [
  { path: '/', icon: Map, label: '足迹' },
  { path: '/timeline', icon: ScrollText, label: '时光' },
  { path: '/add', icon: PlusCircle, label: '记录', isFab: true },
  { path: '/trips', icon: Compass, label: '我们' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const bounceRef = useRef<Record<string, boolean>>({})

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleClick = (path: string) => {
    bounceRef.current[path] = true
    navigate(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="h-px bg-gradient-to-r from-transparent via-warm-300/40 to-transparent" />
      <div className="bg-cream/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto flex justify-around items-end px-4 pt-3 pb-4">
          {TABS.map(({ path, icon: Icon, label, isFab }) => {
            const active = isActive(path)
            const bounced = bounceRef.current[path]
            // 清除 bounce 标记
            if (bounced) {
              setTimeout(() => { bounceRef.current[path] = false }, 200)
            }

            if (isFab) {
              return (
                <button
                  key={path}
                  onClick={() => handleClick(path)}
                  className="flex flex-col items-center gap-1 -mt-2 group"
                >
                  <div className={`w-[52px] h-[52px] bg-gradient-to-br from-warm-500 to-caramel rounded-2xl flex items-center justify-center shadow-lg shadow-warm-500/25 active:scale-90 transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1 animate-pulse-glow ${bounced ? 'animate-tab-bounce' : ''}`}>
                    <Icon className="w-7 h-7 text-white" fill="white" />
                  </div>
                  <span className="text-xs font-semibold text-warm-500 tracking-wide">
                    {label}
                  </span>
                </button>
              )
            }

            return (
              <button
                key={path}
                onClick={() => handleClick(path)}
                className={`flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center transition-all duration-200 relative ${
                  active ? 'text-caramel' : 'text-warm-300'
                } ${bounced ? 'animate-tab-bounce' : ''}`}
              >
                <div className={`relative p-2 rounded-xl transition-colors ${active ? 'bg-warm-100/80' : ''}`}>
                  <Icon className="w-6 h-6" />
                  {active && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-caramel" />
                  )}
                </div>
                <span className="text-xs font-semibold tracking-wide">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
