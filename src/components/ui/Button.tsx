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
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100'

  const variants = {
    primary: 'bg-gradient-to-br from-warm-500 to-caramel text-white shadow-lg shadow-warm-500/20 hover:shadow-xl hover:shadow-warm-500/25 hover:from-warm-600 hover:to-warm-700',
    secondary: 'bg-white text-warm-700 border-2 border-warm-200 hover:border-warm-300 hover:bg-warm-50',
    ghost: 'text-warm-600 hover:bg-warm-100/80',
  }

  const sizes = {
    sm: 'px-5 py-2.5 text-sm rounded-xl',
    md: 'px-7 py-3.5 text-base',
    lg: 'px-10 py-4 text-lg rounded-[18px]',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
