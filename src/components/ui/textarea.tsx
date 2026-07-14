import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[100px] w-full rounded-xl border border-dourado-claro/50 bg-white px-4 py-3 text-sm text-preto placeholder:text-preto-suave/50 transition focus:border-rosa-profundo focus:outline-none focus:ring-2 focus:ring-rosa-profundo/20 dark:border-preto-suave dark:bg-preto/80 dark:text-creme dark:placeholder:text-creme-2/40',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'
