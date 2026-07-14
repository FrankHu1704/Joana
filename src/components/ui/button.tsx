import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'gold'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-gradient text-white shadow-soft hover:shadow-strong hover:-translate-y-0.5',
  dark: 'bg-preto text-creme hover:bg-preto-suave hover:-translate-y-0.5',
  outline: 'border-[1.5px] border-preto text-preto hover:bg-preto hover:text-creme dark:border-creme dark:text-creme dark:hover:bg-creme dark:hover:text-preto',
  ghost: 'text-preto-suave hover:bg-rosa-suave/50 dark:text-creme-2/80 dark:hover:bg-preto-suave/40',
  gold: 'bg-gold-gradient text-preto shadow-soft hover:shadow-strong hover:-translate-y-0.5',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-xs rounded-full',
  md: 'h-11 px-6 text-sm rounded-full',
  lg: 'h-14 px-8 text-base rounded-full',
  icon: 'h-10 w-10 rounded-full',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rosa-profundo focus-visible:ring-offset-2',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
