import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-11 w-full appearance-none rounded-xl border border-dourado-claro/50 bg-white px-4 pr-9 text-sm text-preto transition focus:border-rosa-profundo focus:outline-none focus:ring-2 focus:ring-rosa-profundo/20 dark:border-preto-suave dark:bg-preto/80 dark:text-creme',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-preto-suave/50" />
    </div>
  )
)
Select.displayName = 'Select'
