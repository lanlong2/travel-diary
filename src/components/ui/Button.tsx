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
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 tracking-wide'

  const variants = {
    primary: 'bg-gradient-to-br from-amber to-caramel-700 text-white shadow-lg shadow-caramel/30 hover:shadow-xl hover:shadow-caramel/45 hover:brightness-110',
    secondary: 'glass-nav text-dusk-50 hover:bg-white/10',
    ghost: 'text-dusk-100/70 hover:bg-white/8',
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
