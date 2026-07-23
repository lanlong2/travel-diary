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
          <label className="block text-[13px] font-medium text-dusk-100/80 mb-2 tracking-[0.02em] flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-amber/60" aria-hidden="true" />
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && (
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber/60 transition-colors group-focus-within:text-amber" />
          )}
          <input
            ref={ref}
            className={`w-full bg-dusk-600/40 backdrop-blur-sm border rounded-[14px] py-3.5 transition-all duration-200
              ${Icon ? 'pl-11' : 'pl-4'} pr-4 text-[15px]
              text-dusk-50 placeholder:text-dusk-100/25
              focus:outline-none focus:ring-[1px] focus:ring-amber/30 focus:border-amber/60
              focus:bg-dusk-600/55 focus:shadow-[inset_0_1px_0_oklch(80%_0.14_60_/_0.1),0_4px_16px_oklch(68%_0.17_40_/_0.08)]
              ${error ? 'border-red-400/60 focus:ring-red-400/25' : 'border-dusk-300/30'}
              ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-[13px] text-red-400 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-red-400/60" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
