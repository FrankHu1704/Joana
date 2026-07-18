/**
 * Cliente DebitoPay — orquestrador de pagamentos (payment-orchestrator).
 * Porte directo de functions/checkout.js do pacote DebitoPay for Shopify:
 * um proxy sem estado, sem qualquer tabela ou registo local — a Joana Store
 * não guarda dados da encomenda, apenas encaminha o pedido de pagamento.
 */
const ORCHESTRATOR_URL =
  process.env.DEBITOPAY_ORCHESTRATOR_URL || 'https://gyqoaningqhurhvdugne.supabase.co/functions/v1/payment-orchestrator'

export function isDebitoPayConfigured() {
  return Boolean(process.env.DEBITOPAY_API_KEY && process.env.DEBITOPAY_MERCHANT_ID)
}

interface CreateSessionInput {
  amount: number
  currency: string
  orderId: string
  customerName: string
  customerEmail?: string | null
  returnUrl: string
}

type DebitoPaySessionResult = { ok: true; payment_url: string } | { ok: false; error: string }

export async function createDebitoPaySession(input: CreateSessionInput): Promise<DebitoPaySessionResult> {
  const res = await fetch(ORCHESTRATOR_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEBITOPAY_API_KEY}`,
    },
    body: JSON.stringify({
      action: 'process',
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      merchant_id: process.env.DEBITOPAY_MERCHANT_ID,
      amount: input.amount,
      currency: input.currency,
      customer_name: input.customerName,
      customer_email: input.customerEmail || undefined,
      source: 'joana-store',
      source_id: input.orderId,
      return_url: input.returnUrl,
    }),
  })

  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.payment_url) {
    return { ok: false, error: json?.error || 'debitopay_error' }
  }
  return { ok: true, payment_url: json.payment_url }
}
