'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, ArrowLeftCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminNav } from '@/lib/admin-nav'

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2 px-6 py-5 font-display font-bold text-preto dark:text-creme">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
          <ShieldCheck size={17} />
        </span>
        Joana Admin
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {adminNav.map((item) => {
          const active = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition',
                active ? 'bg-rosa-suave/50 text-rosa-profundo-escuro dark:bg-rosa-profundo/15 dark:text-rosa-suave-2' : 'text-preto-suave hover:bg-creme-2 dark:text-creme-2/70 dark:hover:bg-preto-suave/40'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-dourado-claro/20 p-3 dark:border-preto-suave/50">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-preto-suave hover:bg-creme-2 dark:text-creme-2/70 dark:hover:bg-preto-suave/40">
          <ArrowLeftCircle size={18} /> Ver loja
        </Link>
      </div>
    </div>
  )
}
