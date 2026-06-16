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
          <label className="block text-sm font-semibold text-warm-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
          )}
          <input
            ref={ref}
            className={`w-full bg-white border rounded-2xl py-3.5 transition-all duration-200
              ${Icon ? 'pl-11' : 'pl-4'} pr-4 text-base
              text-warm-900 placeholder:text-warm-300
              focus:outline-none focus:ring-2 focus:ring-warm-500/30 focus:border-warm-500
              ${error ? 'border-red-400 focus:ring-red-400/30' : 'border-warm-300'}
              ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
