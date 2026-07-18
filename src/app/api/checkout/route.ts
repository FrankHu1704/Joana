import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { jsonError, jsonOk } from '@/lib/api-response'
import { createDebitoPaySession, isDebitoPayConfigured } from '@/lib/debitopay'

const schema = z.object({
  items: z.array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1) })).min(1),
  customer_name: z.string().min(1),
  customer_phone: z.string().min(1),
  customer_email: z.string().email().optional().or(z.literal('')),
  coupon_code: z.string().optional(),
})

/**
 * Cria a encomenda (valor recalculado a partir de store_products, nunca
 * confiado a partir do cliente) e abre uma sessão de pagamento DebitoPay.
 * Se as credenciais DebitoPay não estiverem configuradas, a encomenda fica
 * registada como "pending" e o cliente recorre ao fallback via WhatsApp.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError('Dados inválidos', 422)

  const supabase = await createClient()
  const { data: order, error } = await supabase.rpc('store_create_order', {
    p_items: parsed.data.items,
    p_customer_name: parsed.data.customer_name,
    p_customer_phone: parsed.data.customer_phone,
    p_customer_email: parsed.data.customer_email || null,
    p_coupon_code: parsed.data.coupon_code || null,
  })
  if (error || !order) return jsonError(error?.message || 'Não foi possível criar a encomenda', 422)

  if (!isDebitoPayConfigured()) {
    return jsonOk({ order_id: order.id, amount: order.amount, payment_url: null })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const session = await createDebitoPaySession({
    amount: order.amount,
    currency: order.currency,
    orderId: order.id,
    customerName: parsed.data.customer_name,
    customerEmail: parsed.data.customer_email || null,
    returnUrl: `${appUrl}/carrinho/confirmacao?order=${order.id}`,
  })

  if (!session.ok) {
    return jsonOk({ order_id: order.id, amount: order.amount, payment_url: null, provider_error: session.error })
  }

  await supabase.rpc('store_set_order_payment_session', { p_order_id: order.id, p_payment_url: session.payment_url })

  return jsonOk({ order_id: order.id, amount: order.amount, payment_url: session.payment_url })
}
