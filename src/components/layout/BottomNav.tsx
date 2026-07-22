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

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleClick = (path: string) => {
    navigate(path)
  }

  return (
    <nav
      aria-label="主导航"
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pointer-events-none"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
    >
      <div className="glass-nav max-w-[640px] mx-auto px-3 pt-2.5 pb-2.5 pointer-events-auto">
        <div className="flex justify-around items-end">
          {TABS.map(({ path, icon: Icon, label, isFab }) => {
            const active = isActive(path)

            if (isFab) {
              return (
                <button
                  key={path}
                  onClick={() => handleClick(path)}
                  className="flex flex-col items-center gap-1 -mt-3"
                  aria-label={label}
                >
                  <div
                    className="relative w-[54px] h-[54px] bg-gradient-to-br from-amber to-caramel rounded-[14px] flex items-center justify-center transition-all duration-200 active:brightness-95 shadow-lg shadow-amber-glow"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  >
                    <Icon className="w-7 h-7 text-white" fill="white" />
                  </div>
                  <span className="text-[10px] font-semibold text-amber tracking-[0.02em]">
                    {label}
                  </span>
                </button>
              )
            }

            return (
              <button
                key={path}
                onClick={() => handleClick(path)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center transition-colors duration-200 ${
                  active ? 'text-amber' : 'text-dusk-100/55 hover:text-amber/80'
                }`}
              >
                <div className="relative p-2">
                  <Icon className="w-6 h-6 relative" />
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-amber" />
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-[0.01em]">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
