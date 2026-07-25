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
    <div className="min-h-screen relative overflow-hidden page-wrapper" style={{ backgroundColor: 'oklch(22% 0.035 45)' }}>
      <Particles />
      <div className="max-w-[640px] mx-auto pb-28 relative z-10">
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  )
}
