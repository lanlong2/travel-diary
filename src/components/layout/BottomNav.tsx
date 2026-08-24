import { useLocation, useNavigate } from 'react-router-dom'
import { Map, Plus, Compass, ScrollText, Heart } from 'lucide-react'

type TabItem = { path: string; icon: typeof Map; label: string; isPrimary?: boolean }

const TABS: TabItem[] = [
  { path: '/', icon: Map, label: '足迹' },
  { path: '/timeline', icon: ScrollText, label: '时光' },
  { path: '/add', icon: Plus, label: '记录', isPrimary: true },
  { path: '/trips', icon: Compass, label: '旅行' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <>
      <nav aria-label="桌面主导航" className="desktop-nav">
        <button
          type="button"
          className="desktop-brand"
          onClick={() => navigate('/')}
          aria-label="回到足迹首页"
        >
          <span className="desktop-brand__mark" aria-hidden="true">
            <Heart className="h-4 w-4" fill="currentColor" />
          </span>
          <span className="desktop-brand__text">
            <strong>Our Journey</strong>
            <small>共同旅行手账</small>
          </span>
        </button>

        <div className="desktop-nav__links">
          {TABS.map(({ path, icon: Icon, label, isPrimary }) => {
            const active = isActive(path)
            return (
              <button
                type="button"
                key={path}
                onClick={() => navigate(path)}
                aria-current={active ? 'page' : undefined}
                className={`desktop-nav__item ${active ? 'is-active' : ''} ${isPrimary ? 'is-primary' : ''}`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <nav
        aria-label="移动端主导航"
        className="mobile-nav fixed bottom-0 left-0 right-0 z-40 px-3 pointer-events-none"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)' }}
      >
        <div className="glass-nav mx-auto max-w-[620px] px-2 py-2 pointer-events-auto relative">
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber/30 to-transparent" />
          <div className="grid grid-cols-4 items-end">
            {TABS.map(({ path, icon: Icon, label, isPrimary }) => {
              const active = isActive(path)
              return (
                <button
                  type="button"
                  key={path}
                  onClick={() => navigate(path)}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={`mobile-nav__item ${active ? 'is-active' : ''} ${isPrimary ? 'is-primary' : ''}`}
                >
                  <span className={isPrimary ? 'mobile-nav__primary-icon' : 'mobile-nav__icon'}>
                    <Icon
                      className={isPrimary ? 'h-6 w-6' : 'h-[22px] w-[22px]'}
                      strokeWidth={isPrimary ? 2.4 : 2}
                    />
                  </span>
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
