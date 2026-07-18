import crypto from 'node:crypto'
import { NextRequest } from 'next/server'

/**
 * Webhook DebitoPay — porte de functions/webhook.js. Valida o timestamp
 * (janela de 5 min) e a assinatura HMAC-SHA256 do payload antes de aceitar
 * a notificação. A Joana Store não guarda encomendas nem regista dados
 * localmente: este endpoint apenas confirma a assinatura e reconhece a
 * notificação (a confirmação chega ao cliente pelo return_url).
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

  const payload = JSON.parse(raw) as { status?: string }
  if (payload.status !== 'success') return new Response('ignored')

  return new Response('OK')
}
