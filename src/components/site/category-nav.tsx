'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { getCategoryIcon } from '@/lib/category-icons'
import type { Category } from '@/types/database'

export function CategoryNav({ categories }: { categories: Category[] }) {
  const PromoIcon = getCategoryIcon('promocoes')
  const NewIcon = getCategoryIcon('novidades')

  return (
    <section className="container -mt-4 py-8 sm:-mt-8">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {categories.map((c, i) => {
          const Icon = getCategoryIcon(c.slug)
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link
                href={`/categoria/${c.slug}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-dourado-claro/25 bg-white px-3 py-5 text-center shadow-soft transition hover:-translate-y-1 hover:shadow-strong dark:border-preto-suave/60 dark:bg-preto/70"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rosa-suave/50 text-rosa-profundo-escuro dark:bg-rosa-profundo/15 dark:text-rosa-suave-2">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className="text-xs font-bold text-preto dark:text-creme">{c.name}</span>
              </Link>
            </motion.div>
          )
        })}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.25 }}>
          <Link
            href="/categoria/promocoes"
            className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-rosa-profundo/30 bg-rosa-suave/40 px-3 py-5 text-center shadow-soft transition hover:-translate-y-1 hover:shadow-strong dark:bg-rosa-profundo/10"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-rosa-profundo-escuro dark:bg-preto/40 dark:text-rosa-suave-2">
              <PromoIcon size={18} strokeWidth={2} />
            </span>
            <span className="text-xs font-bold text-rosa-profundo-escuro dark:text-rosa-suave-2">Promoções</span>
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.3 }}>
          <Link
            href="/categoria/novidades"
            className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dourado/30 bg-dourado-claro/30 px-3 py-5 text-center shadow-soft transition hover:-translate-y-1 hover:shadow-strong dark:bg-dourado/10"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-preto dark:bg-preto/40 dark:text-dourado-claro">
              <NewIcon size={18} strokeWidth={2} />
            </span>
            <span className="text-xs font-bold text-preto dark:text-dourado-claro">Novidades</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
