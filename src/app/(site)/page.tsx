import { createClient } from '@/lib/supabase/server'
import { HeroBanner } from '@/components/site/hero-banner'
import { CategoryNav } from '@/components/site/category-nav'
import { SectionHeader } from '@/components/site/section-header'
import { ProductCarousel } from '@/components/site/product-carousel'
import { TrackPageView } from '@/components/site/track-page-view'
import type { Category, Product } from '@/types/database'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: promotions }, { data: featured }, { data: newProducts }, { data: mostViewed }] = await Promise.all([
    supabase.from('store_categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('store_products').select('*').eq('is_active', true).eq('is_promotion', true).order('created_at', { ascending: false }).limit(6),
    supabase.from('store_products').select('*').eq('is_active', true).eq('is_featured', true).order('created_at', { ascending: false }).limit(10),
    supabase.from('store_products').select('*').eq('is_active', true).eq('is_new', true).order('created_at', { ascending: false }).limit(10),
    supabase.from('store_products').select('*').eq('is_active', true).order('views_count', { ascending: false }).limit(10),
  ])

  return (
    <>
      <TrackPageView path="/" />
      <HeroBanner promotions={(promotions as Product[]) ?? []} />
      <CategoryNav categories={(categories as Category[]) ?? []} />

      <section className="container py-12">
        <SectionHeader eyebrow="Seleção especial" title="Produtos em destaque" href="/produtos?flag=destaque" />
        <ProductCarousel products={(featured as Product[]) ?? []} />
      </section>

      <section className="bg-creme-2/60 py-12 dark:bg-preto/40">
        <div className="container">
          <SectionHeader eyebrow="Chegou agora" title="Novidades" href="/categoria/novidades" />
          <ProductCarousel products={(newProducts as Product[]) ?? []} />
        </div>
      </section>

      <section className="container py-12">
        <SectionHeader eyebrow="Tendências" title="Produtos mais vistos" href="/produtos?sort=vistos" />
        <ProductCarousel products={(mostViewed as Product[]) ?? []} />
      </section>
    </>
  )
}
