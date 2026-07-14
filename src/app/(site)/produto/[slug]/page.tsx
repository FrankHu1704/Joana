import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGallery } from '@/components/site/product-gallery'
import { ProductActions } from '@/components/site/product-actions'
import { ProductCarousel } from '@/components/site/product-carousel'
import { SectionHeader } from '@/components/site/section-header'
import { Badge } from '@/components/ui/badge'
import { TrackPageView } from '@/components/site/track-page-view'
import { formatMZN, effectivePrice, discountPercent } from '@/lib/utils'
import type { ProductWithCategory, Product } from '@/types/database'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('store_products')
    .select('*, category:store_categories(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  return data as ProductWithCategory | null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
      type: 'website',
    },
  }
}

export default async function ProdutoPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const supabase = await createClient()
  const { data: related } = await supabase
    .from('store_products')
    .select('*')
    .eq('is_active', true)
    .eq('category_id', product.category_id ?? '')
    .neq('id', product.id)
    .limit(8)

  const price = effectivePrice(product)
  const hasDiscount = product.is_promotion && product.promo_price != null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MZN',
      price: price.toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <div className="container py-8">
      <TrackPageView path={`/produto/${slug}`} productId={product.id} categoryId={product.category_id ?? undefined} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 flex items-center gap-1.5 text-xs text-preto-suave/70 dark:text-creme-2/50">
        <Link href="/" className="hover:text-rosa-profundo">Início</Link> /
        {product.category && (
          <>
            <Link href={`/categoria/${product.category.slug}`} className="hover:text-rosa-profundo">{product.category.name}</Link> /
          </>
        )}
        <span className="text-preto dark:text-creme">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <div className="flex flex-wrap gap-2">
            {product.category && <Badge variant="outline">{product.category.name}</Badge>}
            {product.is_promotion && <Badge variant="promo">Promoção</Badge>}
            {product.is_new && <Badge variant="new">Novo</Badge>}
            {product.is_featured && <Badge variant="gold">Destaque</Badge>}
          </div>

          <h1 className="font-display mt-4 text-3xl font-bold text-preto dark:text-creme sm:text-4xl">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-rosa-profundo">{formatMZN(price)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-preto-suave/50 line-through">{formatMZN(product.price)}</span>
                <span className="rounded-lg bg-rosa-profundo/10 px-2 py-1 text-xs font-bold text-rosa-profundo">
                  -{discountPercent(product.price, product.promo_price!)}%
                </span>
              </>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-preto-suave dark:text-creme-2/80">{product.description}</p>

          <div className="mt-8">
            <ProductActions product={product} />
          </div>
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-16">
          <SectionHeader eyebrow="Combina com" title="Produtos relacionados" />
          <ProductCarousel products={related as Product[]} />
        </section>
      )}
    </div>
  )
}
