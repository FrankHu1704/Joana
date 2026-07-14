import { Users, Eye, Package, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/admin/stat-card'
import { VisitsChart, CategoryChart } from '@/components/admin/dashboard-charts'
import { formatDate } from '@/lib/utils'
import type { AdminStats } from '@/types/database'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: stats } = await supabase.rpc('store_admin_stats')
  const s = stats as AdminStats | null

  const since = new Date()
  since.setDate(since.getDate() - 13)
  since.setHours(0, 0, 0, 0)

  const [{ data: views }, { data: categories }, { data: topProducts }, { data: bestSellers }, { data: recentAccess }] = await Promise.all([
    supabase.from('store_page_views').select('created_at, category_id').gte('created_at', since.toISOString()),
    supabase.from('store_categories').select('id, name'),
    supabase.from('store_products').select('id, name, views_count').order('views_count', { ascending: false }).limit(5),
    supabase.from('store_products').select('id, name, sales_count').gt('sales_count', 0).order('sales_count', { ascending: false }).limit(5),
    supabase
      .from('store_page_views')
      .select('id, path, created_at, product:store_products(name), category:store_categories(name)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

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
  const visitsChartData = Array.from(dailyBuckets.entries()).map(([date, viewsCount]) => ({ date, views: viewsCount }))
  const categoryChartData = (categories ?? []).map((c) => ({ name: c.name, views: categoryBuckets.get(c.id) ?? 0 }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-preto dark:text-creme">Dashboard</h1>
        <p className="text-sm text-preto-suave dark:text-creme-2/70">Visão geral da loja em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de visitantes" value={String(s?.total_visitors ?? 0)} icon={Users} accent="rosa" />
        <StatCard label="Visitantes hoje" value={String(s?.visitors_today ?? 0)} icon={Users} accent="dourado" />
        <StatCard label="Produtos cadastrados" value={String(s?.total_products ?? 0)} icon={Package} accent="violet" />
        <StatCard label="Visualizações hoje" value={String(s?.views_today ?? 0)} icon={Eye} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-dourado-claro/25 bg-white p-5 dark:border-preto-suave/60 dark:bg-preto/60 lg:col-span-2">
          <h3 className="font-display mb-4 font-bold text-preto dark:text-creme">Visitas nos últimos 14 dias</h3>
          <div className="h-72">
            <VisitsChart data={visitsChartData} />
          </div>
        </div>
        <div className="rounded-2xl border border-dourado-claro/25 bg-white p-5 dark:border-preto-suave/60 dark:bg-preto/60">
          <h3 className="font-display mb-4 font-bold text-preto dark:text-creme">Visualizações por categoria</h3>
          <div className="h-72">
            <CategoryChart data={categoryChartData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-dourado-claro/25 bg-white p-5 dark:border-preto-suave/60 dark:bg-preto/60">
          <h3 className="font-display mb-4 flex items-center gap-2 font-bold text-preto dark:text-creme">
            <Eye size={16} /> Produtos mais visitados
          </h3>
          <ul className="space-y-3 text-sm">
            {(topProducts ?? []).map((p, i) => (
              <li key={p.id} className="flex items-center justify-between">
                <span className="truncate text-preto-suave dark:text-creme-2/80">
                  {i + 1}. {p.name}
                </span>
                <span className="font-bold text-rosa-profundo">{p.views_count}</span>
              </li>
            ))}
            {(topProducts ?? []).length === 0 && <p className="text-preto-suave/50">Sem dados ainda.</p>}
          </ul>
        </div>

        <div className="rounded-2xl border border-dourado-claro/25 bg-white p-5 dark:border-preto-suave/60 dark:bg-preto/60">
          <h3 className="font-display mb-4 flex items-center gap-2 font-bold text-preto dark:text-creme">
            <TrendingUp size={16} /> Produtos mais vendidos
          </h3>
          <ul className="space-y-3 text-sm">
            {(bestSellers ?? []).map((p, i) => (
              <li key={p.id} className="flex items-center justify-between">
                <span className="truncate text-preto-suave dark:text-creme-2/80">
                  {i + 1}. {p.name}
                </span>
                <span className="font-bold text-emerald-600">{p.sales_count}</span>
              </li>
            ))}
            {(bestSellers ?? []).length === 0 && <p className="text-preto-suave/50">Ainda sem vendas registadas.</p>}
          </ul>
        </div>

        <div className="rounded-2xl border border-dourado-claro/25 bg-white p-5 dark:border-preto-suave/60 dark:bg-preto/60">
          <h3 className="font-display mb-4 font-bold text-preto dark:text-creme">Últimos acessos</h3>
          <ul className="space-y-3 text-xs">
            {(recentAccess ?? []).map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-2">
                <span className="truncate text-preto-suave dark:text-creme-2/80">
                  {v.product?.name || v.category?.name || v.path}
                </span>
                <span className="shrink-0 text-preto-suave/50">{formatDate(v.created_at, { timeStyle: 'short', dateStyle: undefined })}</span>
              </li>
            ))}
            {(recentAccess ?? []).length === 0 && <p className="text-preto-suave/50">Sem acessos registados ainda.</p>}
          </ul>
        </div>
      </div>
    </div>
  )
}
