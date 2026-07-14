import { authenticateAdmin } from '@/lib/api-session'
import { jsonOk } from '@/lib/api-response'

export async function GET() {
  const auth = await authenticateAdmin()
  if ('error' in auth) return auth.error

  const { data } = await auth.supabase.rpc('store_admin_stats')

  const since = new Date()
  since.setDate(since.getDate() - 13)
  since.setHours(0, 0, 0, 0)

  const { data: views } = await auth.supabase
    .from('store_page_views')
    .select('created_at, category_id')
    .gte('created_at', since.toISOString())

  const dailyBuckets = new Map<string, number>()
  for (let i = 0; i < 14; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    dailyBuckets.set(d.toISOString().slice(0, 10), 0)
  }
  const categoryBuckets = new Map<string, number>()
  for (const v of views ?? []) {
    const key = v.created_at.slice(0, 10)
    if (dailyBuckets.has(key)) dailyBuckets.set(key, (dailyBuckets.get(key) ?? 0) + 1)
    if (v.category_id) categoryBuckets.set(v.category_id, (categoryBuckets.get(v.category_id) ?? 0) + 1)
  }

  const { data: categories } = await auth.supabase.from('store_categories').select('id, name')
  const categoryChart = (categories ?? []).map((c) => ({ name: c.name, views: categoryBuckets.get(c.id) ?? 0 }))

  const { data: topProducts } = await auth.supabase
    .from('store_products')
    .select('id, name, views_count, sales_count')
    .order('views_count', { ascending: false })
    .limit(5)

  const { data: bestSellers } = await auth.supabase
    .from('store_products')
    .select('id, name, sales_count')
    .gt('sales_count', 0)
    .order('sales_count', { ascending: false })
    .limit(5)

  return jsonOk({
    data: {
      ...data,
      visits_chart: Array.from(dailyBuckets.entries()).map(([date, views]) => ({ date, views })),
      category_chart: categoryChart,
      top_products: topProducts ?? [],
      best_sellers: bestSellers ?? [],
    },
  })
}
