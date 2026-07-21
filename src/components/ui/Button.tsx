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
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-[14px] transition-all duration-200 active:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:brightness-100 tracking-[0.01em]'

  const variants = {
    primary: 'bg-gradient-to-br from-terracotta to-amber text-white hover:brightness-105',
    secondary: 'glass-nav text-dusk-50 hover:bg-white/10',
    ghost: 'text-dusk-100/70 hover:bg-white/8',
  }

  const sizes = {
    sm: 'px-5 py-2.5 text-[13px] rounded-[12px]',
    md: 'px-7 py-3.5 text-[15px]',
    lg: 'px-10 py-4 text-[17px] rounded-[14px]',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={variant === 'primary' ? { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' } : undefined}
      {...props}
    >
      {children}
    </button>
  )
}
