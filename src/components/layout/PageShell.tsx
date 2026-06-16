import { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { Particles } from '../ui/Particles'

interface PageShellProps {
  children: ReactNode
  hideNav?: boolean
}

export function PageShell({ children, hideNav = false }: PageShellProps) {
  return (
    <div className="min-h-screen bg-cream paper-texture relative">
      <Particles />
      <div className="max-w-2xl mx-auto pb-28 relative z-10 animate-fade-in-up">
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  )
}
