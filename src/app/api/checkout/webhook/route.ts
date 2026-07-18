import crypto from 'node:crypto'
import { NextRequest } from 'next/server'
import { createAnonServerClient } from '@/lib/supabase/anon'

/**
 * Webhook DebitoPay — confirma o pagamento e marca a encomenda como paga.
 * Adaptado de functions/webhook.js do pacote DebitoPay for Shopify: valida
 * o timestamp (janela de 5 min) e a assinatura HMAC-SHA256 antes de confiar
 * no payload.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text()
  const sig = req.headers.get('x-debitopay-signature') || ''
  const ts = req.headers.get('x-debitopay-timestamp') || '0'

  const secret = process.env.DEBITOPAY_WEBHOOK_SECRET
  if (!secret) return new Response('not_configured', { status: 500 })

  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) {
    return new Response('bad_sig', { status: 401 })
  }

  const expected = crypto.createHmac('sha256', secret).update(`${ts}.${raw}`).digest('hex')
  const expectedBuf = Buffer.from(expected, 'hex')
  const sigBuf = Buffer.from(sig, 'hex')
  if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
    return new Response('bad_sig', { status: 401 })
  }

  const payload = JSON.parse(raw) as { status?: string; source_id?: string; transaction_id?: string }
  if (payload.status !== 'success') return new Response('ignored')
  if (!payload.source_id) return new Response('bad_payload', { status: 400 })

  const supabase = createAnonServerClient()
  const { data: order, error } = await supabase.rpc('store_mark_order_paid', {
    p_order_id: payload.source_id,
    p_provider_transaction_id: payload.transaction_id || null,
  })
  if (error) return new Response('error', { status: 500 })
  if (!order) return new Response('ignored')

  return new Response('OK')
}
