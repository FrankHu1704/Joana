import { NextRequest } from 'next/server'
import { z } from 'zod'
import { jsonError, jsonOk } from '@/lib/api-response'
import { createDebitoPaySession, isDebitoPayConfigured } from '@/lib/debitopay'

const schema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
  order_id: z.string().min(1),
  customer_name: z.string().min(1),
  customer_email: z.string().email().optional().or(z.literal('')),
  return_url: z.string().url(),
})

/**
 * Proxy sem estado para o orquestrador de pagamentos DebitoPay — nenhuma
 * informação da encomenda é armazenada; apenas encaminhamos o pedido e
 * devolvemos o payment_url. Porte de functions/checkout.js.
 */
export async function POST(req: NextRequest) {
  if (!isDebitoPayConfigured()) return jsonError('DebitoPay não está configurado', 503)

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError('Dados inválidos', 422)

  const session = await createDebitoPaySession({
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    orderId: parsed.data.order_id,
    customerName: parsed.data.customer_name,
    customerEmail: parsed.data.customer_email || null,
    returnUrl: parsed.data.return_url,
  })

  if (!session.ok) return jsonError(session.error, 502)

  return jsonOk({ payment_url: session.payment_url })
}
