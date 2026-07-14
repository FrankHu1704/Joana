import { NextRequest } from 'next/server'
import { z } from 'zod'
import { authenticateAdmin } from '@/lib/api-session'
import { jsonError, jsonOk } from '@/lib/api-response'
import { slugify } from '@/lib/utils'
import { notifySubscribers } from '@/lib/push/send'

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  promo_price: z.number().nonnegative().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  images: z.array(z.string().url()).min(1),
  is_promotion: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_new: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin()
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('page_size') ?? '25')))

  let query = auth.supabase
    .from('store_products')
    .select('*, category:store_categories(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (search) query = query.ilike('name', `%${search}%`)

  const { data, count } = await query
  return jsonOk({ data: data ?? [], pagination: { page, page_size: pageSize, total: count ?? 0 } })
}

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin()
  if ('error' in auth) return auth.error

  const body = await req.json().catch(() => null)
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) return jsonError('Dados inválidos', 422, { details: parsed.error.flatten().fieldErrors })

  let slug = slugify(parsed.data.name)
  const { data: existing } = await auth.supabase.from('store_products').select('id').eq('slug', slug).maybeSingle()
  if (existing) slug = `${slug}-${Date.now().toString(36)}`

  const { data, error } = await auth.supabase
    .from('store_products')
    .insert({ ...parsed.data, slug })
    .select('*, category:store_categories(*)')
    .single()

  if (error) return jsonError('Não foi possível criar o produto', 500)

  if (data.is_active) {
    notifySubscribers(auth.supabase, {
      title: 'Novo produto na Joana Store! ✨',
      body: data.name,
      url: `/produto/${data.slug}`,
      icon: data.images?.[0],
    }).catch(() => {})
  }

  return jsonOk({ data }, 201)
}
