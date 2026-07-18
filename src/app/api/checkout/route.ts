import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { jsonError, jsonOk } from '@/lib/api-response'

const schema = z.object({
  product_ids: z.array(z.string().uuid()).min(1),
  coupon_code: z.string().optional(),
})

/**
 * Best-effort "sale" signal — there is no online payment gateway; the actual
 * order is confirmed by the customer over WhatsApp. This just powers the
 * "produtos mais vendidos" admin view and redeems the coupon, if any.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError('Dados inválidos', 422)

  const supabase = await createClient()
  await supabase.rpc('store_record_sale', { p_product_ids: parsed.data.product_ids })
  if (parsed.data.coupon_code) {
    await supabase.rpc('store_redeem_coupon', { p_code: parsed.data.coupon_code })
  }

  return jsonOk({ recorded: true })
}
