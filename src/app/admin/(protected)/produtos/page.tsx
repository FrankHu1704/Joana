'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Trash2, Pencil, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatMZN } from '@/lib/utils'
import type { ProductWithCategory } from '@/types/database'

export default function AdminProdutosPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/products?${params.toString()}`)
    const json = await res.json()
    setProducts(json?.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function toggleActive(p: ProductWithCategory) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !p.is_active }),
    })
    load()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    toast({ title: 'Produto eliminado', variant: 'success' })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-preto dark:text-creme">Produtos</h1>
          <p className="text-sm text-preto-suave dark:text-creme-2/70">Gira o catálogo da Joana Store.</p>
        </div>
        <Link href="/admin/produtos/novo">
          <Button variant="primary">
            <Plus size={16} /> Novo produto
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-dourado-claro/25 bg-white p-5 dark:border-preto-suave/60 dark:bg-preto/60">
        <div className="relative mb-4 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-preto-suave/50" />
          <Input className="pl-9" placeholder="Pesquisar produtos..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dourado-claro/20 text-left text-preto-suave dark:border-preto-suave/50 dark:text-creme-2/60">
                <th className="pb-2 font-bold">Produto</th>
                <th className="pb-2 font-bold">Categoria</th>
                <th className="pb-2 font-bold">Preço</th>
                <th className="pb-2 font-bold">Estado</th>
                <th className="pb-2 font-bold">Acções</th>
              </tr>
            </thead>
            <tbody>
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-preto-suave/50">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.id} className="border-b border-dourado-claro/10 last:border-0 dark:border-preto-suave/30">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-creme-2">
                        {p.images[0] && <Image src={p.images[0]} alt={p.name} fill sizes="44px" className="object-cover" />}
                      </div>
                      <span className="font-bold text-preto dark:text-creme">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-preto-suave dark:text-creme-2/70">{p.category?.name ?? '—'}</td>
                  <td className="py-3 font-bold text-rosa-profundo">{formatMZN(p.price)}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={p.is_active ? 'new' : 'outline'}>{p.is_active ? 'Activo' : 'Inactivo'}</Badge>
                      {p.is_promotion && <Badge variant="promo">Promo</Badge>}
                      {p.is_featured && <Badge variant="gold">Destaque</Badge>}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleActive(p)} title={p.is_active ? 'Desactivar' : 'Activar'} className="text-preto-suave/60 hover:text-rosa-profundo">
                        {p.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Link href={`/admin/produtos/${p.id}`} className="text-preto-suave/60 hover:text-rosa-profundo">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => handleDelete(p.id)} className="text-preto-suave/60 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
