import { InputHTMLAttributes, forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: LucideIcon
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dusk-100/80 mb-2 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber/70" />
          )}
          <input
            ref={ref}
            className={`w-full bg-dusk-600/40 backdrop-blur-sm border rounded-2xl py-3.5 transition-all duration-200
              ${Icon ? 'pl-11' : 'pl-4'} pr-4 text-base
              text-dusk-50 placeholder:text-dusk-100/35
              focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/60 focus:bg-dusk-600/60
              ${error ? 'border-red-400/60 focus:ring-red-400/30' : 'border-dusk-300/30'}
              ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
