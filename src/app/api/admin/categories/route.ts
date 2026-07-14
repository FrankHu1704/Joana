import { NextRequest } from 'next/server'
import { z } from 'zod'
import { authenticateAdmin } from '@/lib/api-session'
import { jsonError, jsonOk } from '@/lib/api-response'
import { slugify } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1),
  icon: z.string().max(8).optional(),
  sort_order: z.number().int().default(0),
})

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin()
  if ('error' in auth) return auth.error

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError('Dados inválidos', 422)

  const { data, error } = await auth.supabase
    .from('store_categories')
    .insert({ ...parsed.data, slug: slugify(parsed.data.name) })
    .select()
    .single()

  if (error) return jsonError('Categoria já existe', 409)
  return jsonOk({ data }, 201)
}
