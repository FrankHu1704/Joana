import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { jsonOk } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('categoria')
  const search = searchParams.get('q')
  const minPrice = searchParams.get('preco_min')
  const maxPrice = searchParams.get('preco_max')
  const flag = searchParams.get('flag') // 'promocao' | 'novidade' | 'destaque'
  const sort = searchParams.get('sort') // 'recentes' | 'preco_asc' | 'preco_desc' | 'vistos'
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(48, Math.max(1, Number(searchParams.get('page_size') ?? '12')))

  const supabase = await createClient()

  // Filtering on the embedded category's slug requires an inner join so
  // non-matching rows are excluded rather than returned with a null category.
  const categorySelect = category ? 'category:store_categories!inner(*)' : 'category:store_categories(*)'

  let query = supabase
    .from('store_products')
    .select(`*, ${categorySelect}`, { count: 'exact' })
    .eq('is_active', true)
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (category) query = query.eq('store_categories.slug', category)
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  if (minPrice) query = query.gte('price', Number(minPrice))
  if (maxPrice) query = query.lte('price', Number(maxPrice))
  if (flag === 'promocao') query = query.eq('is_promotion', true)
  if (flag === 'novidade') query = query.eq('is_new', true)
  if (flag === 'destaque') query = query.eq('is_featured', true)

  switch (sort) {
    case 'preco_asc':
      query = query.order('price', { ascending: true })
      break
    case 'preco_desc':
      query = query.order('price', { ascending: false })
      break
    case 'vistos':
      query = query.order('views_count', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, count, error } = await query
  if (error) return jsonOk({ data: [], pagination: { page, page_size: pageSize, total: 0 } })

  return jsonOk({ data: data ?? [], pagination: { page, page_size: pageSize, total: count ?? 0 } })
}
