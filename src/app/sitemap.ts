import type { MetadataRoute } from 'next'
import { createAnonServerClient } from '@/lib/supabase/anon'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAnonServerClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('store_products').select('slug, updated_at').eq('is_active', true),
    supabase.from('store_categories').select('slug'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: appUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${appUrl}/produtos`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${appUrl}/categoria/promocoes`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${appUrl}/categoria/novidades`, changeFrequency: 'daily', priority: 0.8 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${appUrl}/categoria/${c.slug}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${appUrl}/produto/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
