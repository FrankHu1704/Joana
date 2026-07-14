import { NextRequest } from 'next/server'
import { z } from 'zod'
import { authenticateAdmin } from '@/lib/api-session'
import { jsonError, jsonOk } from '@/lib/api-response'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  promo_price: z.number().nonnegative().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  images: z.array(z.string().url()).min(1).optional(),
  is_promotion: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_new: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return jsonError('Dados inválidos', 422, { details: parsed.error.flatten().fieldErrors })

  const { data, error } = await auth.supabase
    .from('store_products')
    .update(parsed.data)
    .eq('id', id)
    .select('*, category:store_categories(*)')
    .single()

  if (error || !data) return jsonError('Não foi possível actualizar o produto', 500)
  return jsonOk({ data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const { error } = await auth.supabase.from('store_products').delete().eq('id', id)
  if (error) return jsonError('Não foi possível eliminar o produto', 500)
  return jsonOk({ deleted: true })
}
