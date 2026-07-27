import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] font-semibold tracking-[0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100'

  const variants = {
    primary:
      'border border-amber-honey/20 bg-amber text-dusk-950 shadow-[0_8px_22px_oklch(10%_0.01_50_/_0.28)] hover:bg-amber-honey hover:shadow-[0_10px_26px_oklch(10%_0.01_50_/_0.36)]',
    secondary:
      'border border-dusk-300/25 bg-dusk-700/80 text-dusk-50 shadow-[0_6px_18px_oklch(10%_0.01_50_/_0.2)] hover:border-dusk-200/35 hover:bg-dusk-600/90',
    ghost:
      'text-dusk-100/80 hover:bg-white/[0.07] hover:text-dusk-50',
  }

  const sizes = {
    sm: 'px-4 py-2 text-[13px]',
    md: 'px-6 py-3 text-[15px]',
    lg: 'min-h-12 px-8 py-3.5 text-base',
  }

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {/* 高光扫光 — 悬浮时左→右 */}
      {children}
    </button>
  )
}
