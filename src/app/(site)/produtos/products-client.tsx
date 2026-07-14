'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, Loader2 } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/site/product-card'
import type { Category, Product } from '@/types/database'

const PAGE_SIZE = 12

export function ProductsClient({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const categoria = searchParams.get('categoria') ?? ''
  const q = searchParams.get('q') ?? ''
  const flag = searchParams.get('flag') ?? ''
  const sort = searchParams.get('sort') ?? 'recentes'
  const precoMin = searchParams.get('preco_min') ?? ''
  const precoMax = searchParams.get('preco_max') ?? ''

  const fetchPage = useCallback(
    async (pageToFetch: number, replace: boolean) => {
      setLoading(true)
      const params = new URLSearchParams()
      if (categoria) params.set('categoria', categoria)
      if (q) params.set('q', q)
      if (flag) params.set('flag', flag)
      if (sort) params.set('sort', sort)
      if (precoMin) params.set('preco_min', precoMin)
      if (precoMax) params.set('preco_max', precoMax)
      params.set('page', String(pageToFetch))
      params.set('page_size', String(PAGE_SIZE))

      const res = await fetch(`/api/products?${params.toString()}`)
      const json = await res.json()
      setProducts((prev) => (replace ? json.data ?? [] : [...prev, ...(json.data ?? [])]))
      setTotal(json.pagination?.total ?? 0)
      setLoading(false)
    },
    [categoria, q, flag, sort, precoMin, precoMax]
  )

  useEffect(() => {
    setPage(1)
    fetchPage(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria, q, flag, sort, precoMin, precoMax])

  const loadMore = useCallback(() => {
    setPage((p) => {
      const next = p + 1
      fetchPage(next, false)
      return next
    })
  }, [fetchPage])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && products.length < total) loadMore()
      },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loading, products.length, total, loadMore])

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/produtos?${params.toString()}`)
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
      <aside className={`lg:block ${filtersOpen ? 'block' : 'hidden'}`}>
        <div className="sticky top-24 space-y-6 rounded-2xl border border-dourado-claro/25 bg-white p-5 dark:border-preto-suave/60 dark:bg-preto/60">
          <div className="flex items-center justify-between lg:hidden">
            <h3 className="font-display font-bold">Filtros</h3>
            <button onClick={() => setFiltersOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-preto-suave">Categoria</label>
            <Select value={categoria} onChange={(e) => updateParam('categoria', e.target.value)}>
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-preto-suave">Preço (MT)</label>
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="Mín." value={precoMin} onChange={(e) => updateParam('preco_min', e.target.value)} />
              <span className="text-preto-suave/50">—</span>
              <Input type="number" placeholder="Máx." value={precoMax} onChange={(e) => updateParam('preco_max', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-preto-suave">Destaques</label>
            <div className="space-y-2 text-sm font-medium">
              {[
                { value: '', label: 'Todos' },
                { value: 'novidade', label: 'Novidades' },
                { value: 'promocao', label: 'Promoções' },
                { value: 'destaque', label: 'Em destaque' },
              ].map((opt) => (
                <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                  <input type="radio" name="flag" checked={flag === opt.value} onChange={() => updateParam('flag', opt.value)} className="accent-rosa-profundo" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => setFiltersOpen(true)} className="flex items-center gap-2 rounded-full border border-dourado-claro/40 px-4 py-2 text-sm font-bold lg:hidden">
            <SlidersHorizontal size={15} /> Filtros
          </button>
          <p className="text-sm text-preto-suave dark:text-creme-2/70">{total} produto{total !== 1 ? 's' : ''}</p>
          <Select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="w-44">
            <option value="recentes">Mais recentes</option>
            <option value="preco_asc">Preço: menor</option>
            <option value="preco_desc">Preço: maior</option>
            <option value="vistos">Mais vistos</option>
          </Select>
        </div>

        {products.length === 0 && !loading ? (
          <p className="py-16 text-center text-preto-suave/60">Nenhum produto encontrado com estes filtros.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="flex justify-center py-8">
          {loading && <Loader2 className="animate-spin text-rosa-profundo" size={24} />}
        </div>

        {!loading && products.length < total && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={loadMore}>
              Carregar mais
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
