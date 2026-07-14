import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { jsonError, jsonOk } from '@/lib/api-response'

const schema = z.object({ code: z.string().min(1) })

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError('Código inválido', 422)

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('store_validate_coupon', { p_code: parsed.data.code })
  if (error) return jsonError('Não foi possível validar o cupão', 500)

  return jsonOk({ data })
}
