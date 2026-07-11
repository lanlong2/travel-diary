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
    <nav
      aria-label="主导航"
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pointer-events-none"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
    >
      <div className="glass-nav max-w-2xl mx-auto px-3 pt-2.5 pb-2.5 pointer-events-auto">
        <div className="flex justify-around items-end">
          {TABS.map(({ path, icon: Icon, label, isFab }) => {
            const active = isActive(path)
            const bounced = bounceRef.current[path]
            if (bounced) {
              setTimeout(() => { bounceRef.current[path] = false }, 200)
            }

            if (isFab) {
              return (
                <button
                  key={path}
                  onClick={() => handleClick(path)}
                  className="flex flex-col items-center gap-1 -mt-3 group"
                >
                  <div
                    className={`w-[54px] h-[54px] bg-gradient-to-br from-amber to-caramel-700 rounded-2xl flex items-center justify-center shadow-lg shadow-caramel/40 active:scale-90 transition-all duration-200 group-hover:shadow-caramel/55 group-hover:-translate-y-1 animate-pulse-glow ${bounced ? 'animate-tab-bounce' : ''}`}
                  >
                    <Icon className="w-7 h-7 text-white" fill="white" />
                  </div>
                  <span className="text-[10px] font-semibold text-amber tracking-wider">
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
                  active ? 'text-amber' : 'text-dusk-100/55'
                } ${bounced ? 'animate-tab-bounce' : ''}`}
              >
                <div
                  className={`relative p-2 rounded-xl transition-colors ${
                    active ? 'bg-amber/15' : ''
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-amber" />
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-wider">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
