import { useEffect, useRef, useState } from 'react'
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
  const [navBounce, setNavBounce] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  // 路由变化时整体上弹一次
  useEffect(() => {
    setNavBounce(true)
    const id = setTimeout(() => setNavBounce(false), 320)
    return () => clearTimeout(id)
  }, [location.pathname])

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
      <div
        className="glass-nav max-w-2xl mx-auto px-3 pt-2.5 pb-2.5 pointer-events-auto transition-transform duration-300"
        style={{
          transform: navBounce ? 'translateY(0)' : 'translateY(0)',
          animation: navBounce ? 'navPop 0.32s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
        }}
      >
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
                  <div className="relative">
                    {/* 旋转光轨 */}
                    <span
                      className="absolute -inset-1.5 rounded-[20px] pointer-events-none animate-rotate-halo"
                      style={{
                        background:
                          'conic-gradient(from 0deg, transparent 0%, oklch(68% 0.17 40 / 0.65) 25%, transparent 50%, oklch(55% 0.15 35 / 0.55) 75%, transparent 100%)',
                        filter: 'blur(4px)',
                        animationDuration: '5s',
                      }}
                      aria-hidden="true"
                    />
                    <div
                      className={`relative w-[54px] h-[54px] bg-gradient-to-br from-amber to-caramel-700 rounded-2xl flex items-center justify-center shadow-lg shadow-caramel/40 active:scale-90 transition-all duration-200 group-hover:shadow-caramel/60 group-hover:-translate-y-1 animate-pulse-glow ${
                        bounced ? 'animate-tab-bounce' : ''
                      }`}
                    >
                      <Icon className="w-7 h-7 text-white" fill="white" />
                    </div>
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
                  active ? 'text-amber' : 'text-dusk-100/55 hover:text-amber/80'
                } ${bounced ? 'animate-tab-bounce' : ''}`}
              >
                <div className={`relative p-2 rounded-xl transition-colors ${active ? 'bg-amber/15' : ''}`}>
                  {/* active 呼吸光晕 */}
                  {active && (
                    <span
                      className="absolute inset-0 rounded-xl pointer-events-none animate-ripple"
                      style={{ opacity: 0.45 }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon className="w-6 h-6 relative" />
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

      <style>{`
        @keyframes navPop {
          0% { transform: translateY(20px); opacity: 0.7; }
          60% { transform: translateY(-3px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </nav>
  )
}
