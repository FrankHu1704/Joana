import { NextRequest } from 'next/server'
import { z } from 'zod'
import { jsonError, jsonOk } from '@/lib/api-response'
import { chargeDebitoPay, isDebitoPayConfigured } from '@/lib/debitopay'

const schema = z.object({
  payment_method: z.enum(['mpesa', 'emola', 'mkesh', 'visa_mastercard']),
  amount: z.number().positive(),
  currency: z.string().min(1),
  order_id: z.string().min(1),
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().min(1).optional(),
  return_url: z.string().url().optional(),
})

/**
 * Cobra directamente via M-Pesa/e-Mola/mKesh (push USSD para o telemóvel do
 * cliente) ou devolve um checkout_url para Visa/Mastercard. Proxy sem
 * estado — nenhuma informação da encomenda é guardada. Porte de
 * api/donate.js (Frank AI Solutions).
 */
export async function POST(req: NextRequest) {
  if (!isDebitoPayConfigured()) return jsonError('Debito Pay não está configurado', 503)

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError('Dados inválidos', 422)

  if (parsed.data.payment_method !== 'visa_mastercard' && !parsed.data.customer_phone) {
    return jsonError('customer_phone é obrigatório para M-Pesa/e-Mola/mKesh', 422)
  }

  const customerIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null

  const result = await chargeDebitoPay({
    paymentMethod: parsed.data.payment_method,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    orderId: parsed.data.order_id,
    customerName: parsed.data.customer_name,
    customerEmail: parsed.data.customer_email,
    customerPhone: parsed.data.customer_phone,
    returnUrl: parsed.data.return_url,
    customerIp,
  })

  if (!result.ok) return jsonError(result.error, 502)

  return jsonOk({
    payment_id: result.paymentId,
    status: result.status,
    checkout_url: result.checkoutUrl,
    reference: result.reference,
  })
}
