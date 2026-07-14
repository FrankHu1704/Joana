import { createClient } from '@/lib/supabase/server'
import { jsonOk } from '@/lib/api-response'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('store_categories').select('*').order('sort_order', { ascending: true })
  return jsonOk({ data: data ?? [] })
}
