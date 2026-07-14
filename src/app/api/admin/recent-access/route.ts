import { authenticateAdmin } from '@/lib/api-session'
import { jsonOk } from '@/lib/api-response'

export async function GET() {
  const auth = await authenticateAdmin()
  if ('error' in auth) return auth.error

  const { data } = await auth.supabase
    .from('store_page_views')
    .select('id, path, created_at, product:store_products(name), category:store_categories(name)')
    .order('created_at', { ascending: false })
    .limit(20)

  return jsonOk({ data: data ?? [] })
}
