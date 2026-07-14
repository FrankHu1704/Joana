import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/site/product-grid'
import { TrackPageView } from '@/components/site/track-page-view'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types/database'

export const revalidate = 60

const VIRTUAL_SECTIONS: Record<string, { name: string; description: string }> = {
  promocoes: { name: 'Promoções', description: 'Peças seleccionadas com desconto especial, por tempo limitado.' },
  novidades: { name: 'Novidades', description: 'As últimas chegadas à Joana Store.' },
}

const PAGE_SIZE = 12

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  if (VIRTUAL_SECTIONS[slug]) {
    return { title: VIRTUAL_SECTIONS[slug].name, description: VIRTUAL_SECTIONS[slug].description }
  }

  const { data: category } = await supabase.from('store_categories').select('name').eq('slug', slug).maybeSingle()
  if (!category) return {}
  return { title: category.name, description: `Compre ${category.name.toLowerCase()} na Joana Store.` }
}

export default async function CategoriaPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? '1'))
  const supabase = await createClient()

  let title: string
  let description: string
  let query = supabase.from('store_products').select('*', { count: 'exact' }).eq('is_active', true)

  if (VIRTUAL_SECTIONS[slug]) {
    title = VIRTUAL_SECTIONS[slug].name
    description = VIRTUAL_SECTIONS[slug].description
    query = query.eq(slug === 'promocoes' ? 'is_promotion' : 'is_new', true)
  } else {
    const { data: category } = await supabase.from('store_categories').select('*').eq('slug', slug).maybeSingle()
    if (!category) notFound()
    title = category.name
    description = `Compre ${category.name.toLowerCase()} na Joana Store.`
    query = query.eq('category_id', category.id)
  }

  const { data: products, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  return (
    <div className="container py-8">
      <TrackPageView path={`/categoria/${slug}`} />
      <h1 className="font-display text-3xl font-bold text-preto dark:text-creme">{title}</h1>
      <p className="mt-1 text-sm text-preto-suave dark:text-creme-2/70">{description}</p>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-preto-suave/60">
        {count ?? 0} produto{(count ?? 0) !== 1 ? 's' : ''}
      </p>

      <div className="mt-6">
        <ProductGrid products={(products as Product[]) ?? []} />
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link key={i} href={`/categoria/${slug}?page=${i + 1}`}>
              <Button variant={page === i + 1 ? 'primary' : 'outline'} size="sm">
                {i + 1}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
