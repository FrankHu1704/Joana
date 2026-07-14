'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HeartOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useFavoritesStore } from '@/lib/stores/favorites-store'
import { ProductGrid } from '@/components/site/product-grid'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types/database'

export default function FavoritosPage() {
  const ids = useFavoritesStore((s) => s.ids)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('store_products')
      .select('*')
      .in('id', ids)
      .eq('is_active', true)
      .then(({ data }) => {
        setProducts((data as Product[]) ?? [])
        setLoading(false)
      })
  }, [ids])

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold text-preto dark:text-creme">Os meus favoritos</h1>
      <p className="mt-1 text-sm text-preto-suave dark:text-creme-2/70">Produtos que guardou para mais tarde.</p>

      <div className="mt-8">
        {!loading && products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <HeartOff size={40} className="text-preto-suave/30" />
            <p className="text-preto-suave dark:text-creme-2/60">Ainda não tem favoritos.</p>
            <Link href="/produtos">
              <Button variant="primary">Explorar produtos</Button>
            </Link>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  )
}
