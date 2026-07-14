import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'
import type { Category, Product } from '@/types/database'

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('store_products').select('*').eq('id', id).maybeSingle(),
    supabase.from('store_categories').select('*').order('sort_order', { ascending: true }),
  ])

  if (!product) notFound()

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-preto dark:text-creme">Editar produto</h1>
      <p className="mt-1 text-sm text-preto-suave dark:text-creme-2/70">{product.name}</p>
      <div className="mt-6 rounded-2xl border border-dourado-claro/25 bg-white p-6 dark:border-preto-suave/60 dark:bg-preto/60">
        <ProductForm categories={(categories as Category[]) ?? []} product={product as Product} />
      </div>
    </div>
  )
}
