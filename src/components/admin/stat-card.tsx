import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'rosa',
}: {
  label: string
  value: string
  icon: LucideIcon
  accent?: 'rosa' | 'dourado' | 'emerald' | 'violet'
}) {
  const accents: Record<string, string> = {
    rosa: 'bg-rosa-suave/50 text-rosa-profundo-escuro dark:bg-rosa-profundo/15 dark:text-rosa-suave-2',
    dourado: 'bg-dourado-claro/40 text-preto dark:bg-dourado/15 dark:text-dourado-claro',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  }

  return (
    <div className="rounded-2xl border border-dourado-claro/25 bg-white p-5 dark:border-preto-suave/60 dark:bg-preto/60">
      <div className="flex items-center justify-between">
        <p className="text-sm text-preto-suave dark:text-creme-2/70">{label}</p>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', accents[accent])}>
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-preto dark:text-creme">{value}</p>
    </div>
  )
}
