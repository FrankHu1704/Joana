'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Menu, ShoppingBag, X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { SearchBar } from './search-bar'
import { useCartStore } from '@/lib/stores/cart-store'
import { useFavoritesStore } from '@/lib/stores/favorites-store'
import { waLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

const GENERIC_WA_MSG = 'Olá Joana Store! 👋 Vi o site e quero fazer uma encomenda.'

export function Navbar({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const cartCount = useCartStore((s) => s.count())
  const favCount = useFavoritesStore((s) => s.ids.length)

  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-50 border-b border-dourado-claro/25 bg-creme/90 backdrop-blur-lg dark:border-preto-suave/60 dark:bg-surface-dark/90">
      <nav className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display shrink-0 text-xl font-bold text-preto dark:text-creme">
          Joana <span className="text-rosa-profundo">Store</span>
        </Link>

        <div className="hidden flex-1 lg:block">
          <SearchBar />
        </div>

        <div className="hidden items-center gap-6 text-sm font-bold lg:flex">
          {categories.slice(0, 4).map((c) => (
            <Link key={c.id} href={`/categoria/${c.slug}`} className="text-preto-suave transition hover:text-rosa-profundo dark:text-creme-2/80">
              {c.name}
            </Link>
          ))}
          <Link href="/categoria/promocoes" className="text-rosa-profundo transition hover:text-rosa-profundo-escuro">
            Promoções
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle className="hidden h-10 w-10 items-center justify-center rounded-full border border-dourado-claro/40 text-preto-suave transition hover:bg-rosa-suave/40 dark:border-preto-suave dark:text-creme-2 sm:flex" />
          <Link
            href="/favoritos"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-preto-suave transition hover:bg-rosa-suave/40 dark:text-creme-2 dark:hover:bg-preto-suave/40"
          >
            <Heart size={19} />
            {mounted && favCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rosa-profundo text-[10px] font-bold text-white">
                {favCount}
              </span>
            )}
          </Link>
          <Link
            href="/carrinho"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-preto-suave transition hover:bg-rosa-suave/40 dark:text-creme-2 dark:hover:bg-preto-suave/40"
          >
            <ShoppingBag size={19} />
            {mounted && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rosa-profundo text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <a
            href={waLink(GENERIC_WA_MSG)}
            target="_blank"
            rel="noopener"
            className="hidden rounded-full bg-preto px-5 py-2.5 text-xs font-bold text-creme transition hover:bg-preto-suave sm:inline-block"
          >
            Encomendar
          </a>
          <button onClick={() => setOpen((v) => !v)} className="flex h-10 w-10 items-center justify-center text-preto-suave dark:text-creme-2 lg:hidden">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <div className={cn('overflow-hidden border-t border-dourado-claro/20 bg-creme-2 transition-[max-height] duration-300 dark:border-preto-suave/60 dark:bg-preto lg:hidden', open ? 'max-h-[420px]' : 'max-h-0')}>
        <div className="container flex flex-col gap-4 py-5">
          <SearchBar compact onNavigate={() => setOpen(false)} />
          <div className="flex flex-col gap-1">
            {categories.map((c) => (
              <Link key={c.id} href={`/categoria/${c.slug}`} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 text-sm font-bold text-preto dark:text-creme">
                {c.name}
              </Link>
            ))}
            <Link href="/categoria/promocoes" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 text-sm font-bold text-rosa-profundo">
              Promoções
            </Link>
            <Link href="/categoria/novidades" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 text-sm font-bold text-preto dark:text-creme">
              Novidades
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href={waLink(GENERIC_WA_MSG)} target="_blank" rel="noopener" className="flex-1 rounded-full bg-preto px-5 py-3 text-center text-sm font-bold text-creme">
              Fazer encomenda
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
