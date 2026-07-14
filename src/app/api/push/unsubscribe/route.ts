import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { jsonError, jsonOk } from '@/lib/api-response'

const schema = z.object({ endpoint: z.string().url() })

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError('Dados inválidos', 422)

  const supabase = await createClient()
  const { error } = await supabase.rpc('store_unsubscribe_push', { p_endpoint: parsed.data.endpoint })
  if (error) return jsonError('Não foi possível desactivar as notificações', 500)
  return jsonOk({ unsubscribed: true })
}
