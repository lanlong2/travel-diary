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
      <div className="glass-nav max-w-[640px] mx-auto px-3 pt-2.5 pb-2.5 pointer-events-auto relative">
        {/* 顶部细金线 — 反光感 */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber/30 to-transparent" />

        <div className="flex justify-around items-end">
          {TABS.map(({ path, icon: Icon, label, isFab }) => {
            const active = isActive(path)

            if (isFab) {
              return (
                <button
                  key={path}
                  onClick={() => handleClick(path)}
                  className="flex flex-col items-center gap-1 -mt-3 group"
                  aria-label={label}
                >
                  <div
                    className="relative w-[54px] h-[54px] bg-gradient-to-br from-amber via-amber to-amber-ember rounded-[16px] flex items-center justify-center transition-all duration-300 active:brightness-95 active:scale-95 group-hover:scale-105 group-hover:rotate-[-2deg]"
                    style={{
                      boxShadow:
                        '0 8px 24px oklch(68% 0.17 40 / 0.35), 0 0 0 1px oklch(80% 0.14 60 / 0.4), inset 0 1px 0 oklch(96% 0.02 70 / 0.25), inset 0 -2px 4px oklch(50% 0.15 35 / 0.3)',
                    }}
                  >
                    {/* 邮戳外环 */}
                    <div
                      className="absolute inset-1 rounded-[12px] border border-white/20 pointer-events-none"
                      aria-hidden="true"
                    />
                    <Icon className="w-7 h-7 text-white relative" fill="white" />
                  </div>
                  <span className="text-[10px] font-semibold text-amber tracking-[0.05em]">
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
                className={`flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center transition-all duration-300 ${
                  active ? 'text-amber' : 'text-dusk-100/55 hover:text-amber/80'
                }`}
              >
                <div className="relative p-2 transition-transform duration-300 active:scale-90">
                  <Icon className={`w-6 h-6 relative transition-transform duration-300 ${active ? 'scale-105' : ''}`} />
                  {active && (
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-gradient-to-r from-transparent via-amber to-transparent"
                      style={{ boxShadow: '0 0 6px oklch(68% 0.17 40 / 0.5)' }}
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-[0.03em]">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
