import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TrackPageView } from '@/components/site/track-page-view'
import { ProductsClient } from './products-client'
import type { Category } from '@/types/database'

export const metadata: Metadata = { title: 'Todos os produtos' }
export const revalidate = 60

export default async function ProdutosPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('store_categories').select('*').order('sort_order', { ascending: true })

  return (
    <div className="container py-8">
      <TrackPageView path="/produtos" />
      <h1 className="font-display text-3xl font-bold text-preto dark:text-creme">Todos os produtos</h1>
      <p className="mt-1 text-sm text-preto-suave dark:text-creme-2/70">Explore o catálogo completo da Joana Store.</p>

      <Suspense fallback={null}>
        <ProductsClient categories={(categories as Category[]) ?? []} />
      </Suspense>
    </div>
  )
}
