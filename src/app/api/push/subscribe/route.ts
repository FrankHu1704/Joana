import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { jsonError, jsonOk } from '@/lib/api-response'

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError('Dados de subscrição inválidos', 422)

  const supabase = await createClient()
  const { error } = await supabase.rpc('store_subscribe_push', {
    p_endpoint: parsed.data.endpoint,
    p_p256dh: parsed.data.keys.p256dh,
    p_auth: parsed.data.keys.auth,
  })

  if (error) return jsonError('Não foi possível activar as notificações', 500)
  return jsonOk({ subscribed: true })
}
