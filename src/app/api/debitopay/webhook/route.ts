import crypto from 'node:crypto'
import { NextRequest } from 'next/server'

/**
 * Webhook Debito Pay — opcional: o polling em /api/debitopay/status já
 * confirma o pagamento no browser, este endpoint não é obrigatório para a
 * UX funcionar. Regista em Settings → Webhooks na Debito Pay apenas se
 * quiser um registo server-side dos eventos payment.completed/failed.
 * Valida a assinatura HMAC-SHA256 (header x-webhook-signature, sobre o
 * corpo em bruto) conforme a documentação oficial — sem base de dados,
 * apenas confirma a assinatura.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.DEBITO_PAY_WEBHOOK_SECRET
  if (!secret) return new Response('not_configured', { status: 500 })

  const raw = await req.text()
  const sig = req.headers.get('x-webhook-signature') || ''

  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
  const expectedBuf = Buffer.from(expected, 'hex')
  const sigBuf = Buffer.from(sig, 'hex')
  if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
    return new Response('bad_sig', { status: 401 })
  }

  // payload.event: payment.completed | payment.failed | payment.refunded | payment.chargeback
  JSON.parse(raw)

  return new Response('OK')
}
