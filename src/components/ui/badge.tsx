import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'promo' | 'new' | 'gold' | 'outline'

const variants: Record<Variant, string> = {
  default: 'bg-preto text-creme',
  promo: 'bg-rosa-profundo text-white',
  new: 'bg-emerald-600 text-white',
  gold: 'bg-gold-gradient text-preto',
  outline: 'border border-preto/20 text-preto dark:border-creme/30 dark:text-creme',
}

export function Badge({ className, variant = 'default', ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide', variants[variant], className)}
      {...props}
    />
  )
}
