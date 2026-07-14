import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'
import type { Category } from '@/types/database'

export default async function NovoProdutoPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('store_categories').select('*').order('sort_order', { ascending: true })

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-preto dark:text-creme">Novo produto</h1>
      <p className="mt-1 text-sm text-preto-suave dark:text-creme-2/70">Adicione um novo produto ao catálogo.</p>
      <div className="mt-6 rounded-2xl border border-dourado-claro/25 bg-white p-6 dark:border-preto-suave/60 dark:bg-preto/60">
        <ProductForm categories={(categories as Category[]) ?? []} />
      </div>
    </div>
  )
}
