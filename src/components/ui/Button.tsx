import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-[14px] transition-all duration-300 active:brightness-95 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:brightness-100 disabled:active:scale-100 tracking-[0.01em] relative overflow-hidden'

  const variants = {
    primary:
      'bg-gradient-to-br from-amber via-amber to-amber-ember text-white hover:brightness-105 edge-glow-amber hover:shadow-[0_12px_36px_oklch(68%_0.17_40_/_0.35),0_0_0_1px_oklch(80%_0.14_60_/_0.4),inset_0_1px_0_oklch(96%_0.02_70_/_0.25)]',
    secondary:
      'glass-nav text-dusk-50 hover:bg-white/10 hover:border-amber-glow/40',
    ghost:
      'text-dusk-100/70 hover:bg-white/8 hover:text-amber',
  }

  const sizes = {
    sm: 'px-5 py-2.5 text-[13px] rounded-[12px]',
    md: 'px-7 py-3.5 text-[15px]',
    lg: 'px-10 py-4 text-[17px] rounded-[14px]',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {/* 高光扫光 — 悬浮时左→右 */}
      <span
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.18) 50%, transparent 100%)',
          transform: 'translateX(-100%)',
        }}
        aria-hidden="true"
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  )
}
