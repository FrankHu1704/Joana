'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatMZN, effectivePrice } from '@/lib/utils'
import type { ProductWithCategory } from '@/types/database'

export function SearchBar({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    const t = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(query)}&page_size=5`)
        .then((r) => r.json())
        .then((res) => setResults(res?.data ?? []))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function goToResults() {
    if (!query.trim()) return
    router.push(`/produtos?q=${encodeURIComponent(query)}`)
    setOpen(false)
    onNavigate?.()
  }

  return (
    <div ref={boxRef} className={compact ? 'relative w-full' : 'relative w-full max-w-md'}>
      <div className="relative">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-preto-suave/50" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && goToResults()}
          placeholder="Procurar produtos, categorias..."
          className="pl-11 pr-9"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-preto-suave/50 hover:text-preto-suave">
            <X size={15} />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-dourado-claro/30 bg-white shadow-strong dark:border-preto-suave dark:bg-preto">
          {loading && (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-preto-suave">
              <Loader2 size={16} className="animate-spin" /> A procurar...
            </div>
          )}
          {!loading && results.length === 0 && <p className="p-6 text-center text-sm text-preto-suave">Nenhum resultado encontrado.</p>}
          {!loading &&
            results.map((p) => (
              <Link
                key={p.id}
                href={`/produto/${p.slug}`}
                onClick={() => {
                  setOpen(false)
                  onNavigate?.()
                }}
                className="flex items-center gap-3 border-b border-dourado-claro/10 p-3 last:border-0 hover:bg-rosa-suave/20 dark:border-preto-suave/50 dark:hover:bg-preto-suave/30"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-creme-2">
                  {p.images[0] && <Image src={p.images[0]} alt={p.name} fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-preto dark:text-creme">{p.name}</p>
                  <p className="text-sm font-bold text-rosa-profundo">{formatMZN(effectivePrice(p))}</p>
                </div>
              </Link>
            ))}
          {!loading && results.length > 0 && (
            <button onClick={goToResults} className="w-full border-t border-dourado-claro/10 p-3 text-center text-sm font-bold text-rosa-profundo dark:border-preto-suave/50">
              Ver todos os resultados
            </button>
          )}
        </div>
      )}
    </div>
  )
}
