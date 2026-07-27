import { ReactNode, useEffect } from 'react'
import { BottomNav } from './BottomNav'
import { Particles } from '../ui/Particles'

interface PageShellProps {
  children: ReactNode
  hideNav?: boolean
}

export function PageShell({ children, hideNav = false }: PageShellProps) {
  // 全局 IntersectionObserver — 驱动滚动触发展示
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )

    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="app-shell min-h-dvh relative overflow-x-clip page-wrapper">
      <a href="#main-content" className="skip-link">跳到主要内容</a>
      <Particles />
      {!hideNav && <BottomNav />}
      <main id="main-content" className={`app-main relative z-10 ${hideNav ? 'app-main--focused' : ''}`}>
        {children}
      </main>
    </div>
  )
}
