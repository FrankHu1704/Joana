import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function SectionHeader({ eyebrow, title, href, hrefLabel = 'Ver tudo' }: { eyebrow: string; title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rosa-profundo-escuro before:h-px before:w-4 before:bg-dourado">
          {eyebrow}
        </span>
        <h2 className="font-display mt-2 text-2xl font-bold text-preto dark:text-creme sm:text-3xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-bold text-preto-suave transition hover:text-rosa-profundo dark:text-creme-2/80">
          {hrefLabel} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  )
}
