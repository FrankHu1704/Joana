import { NextRequest } from 'next/server'
import { z } from 'zod'
import { authenticateAdmin } from '@/lib/api-session'
import { jsonError, jsonOk } from '@/lib/api-response'

const schema = z.object({
  code: z.string().min(2).transform((s) => s.toUpperCase()),
  discount_percent: z.number().min(0).max(100).default(0),
  discount_amount: z.number().min(0).default(0),
  valid_until: z.string().datetime().optional().nullable(),
  max_uses: z.number().int().positive().optional().nullable(),
})

export async function GET() {
  const auth = await authenticateAdmin()
  if ('error' in auth) return auth.error

  const { data } = await auth.supabase.from('store_coupons').select('*').order('created_at', { ascending: false })
  return jsonOk({ data: data ?? [] })
}

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin()
  if ('error' in auth) return auth.error

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError('Dados inválidos', 422, { details: parsed.error.flatten().fieldErrors })

  const { data, error } = await auth.supabase.from('store_coupons').insert(parsed.data).select().single()
  if (error) return jsonError('Código de cupão já existe', 409)
  return jsonOk({ data }, 201)
}
