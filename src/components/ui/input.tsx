import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border border-dourado-claro/50 bg-white px-4 text-sm text-preto placeholder:text-preto-suave/50 transition focus:border-rosa-profundo focus:outline-none focus:ring-2 focus:ring-rosa-profundo/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-preto-suave dark:bg-preto/80 dark:text-creme dark:placeholder:text-creme-2/40',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
