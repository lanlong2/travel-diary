import { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { Particles } from '../ui/Particles'

interface PageShellProps {
  children: ReactNode
  hideNav?: boolean
}

export function PageShell({ children, hideNav = false }: PageShellProps) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'oklch(24% 0.03 45)' }}>
      <Particles />
      <div className="max-w-[640px] mx-auto pb-28 relative z-10 animate-page-enter">
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  )
}
