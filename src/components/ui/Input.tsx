import { InputHTMLAttributes, forwardRef, useId } from 'react'
import type { LucideIcon } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: LucideIcon
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      icon: Icon,
      error,
      className = '',
      id,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = id ?? `input-${generatedId}`
    const errorId = `${inputId}-error`
    const describedBy =
      [ariaDescribedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-dusk-100/85">
            {label}
          </label>
        )}
        <div className="group relative">
          {Icon && (
            <Icon
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-dusk-100/50 transition-colors group-focus-within:text-amber"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            aria-describedby={describedBy}
            aria-errormessage={error ? errorId : undefined}
            aria-invalid={error ? true : ariaInvalid}
            className={`min-h-12 w-full rounded-[10px] border bg-dusk-700/65 py-3 transition-[background-color,border-color,box-shadow] duration-200
              ${Icon ? 'pl-11' : 'pl-4'} pr-4 text-base
              text-dusk-50 placeholder:text-dusk-100/40
              focus:border-amber/70 focus:bg-dusk-700 focus:outline-none focus:ring-2 focus:ring-amber/20
              ${error ? 'border-red-400/70 focus:border-red-400 focus:ring-red-400/20' : 'border-dusk-300/35'}
              ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-2 text-[13px] leading-5 text-red-300">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
