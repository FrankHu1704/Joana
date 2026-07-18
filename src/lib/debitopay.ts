/**
 * Cliente Debito Pay — payment-orchestrator. Cobra directamente via
 * M-Pesa/e-Mola/mKesh (push USSD para o telemóvel do cliente — sem
 * redireccionar para nenhum site) ou devolve um checkout_url para
 * Visa/Mastercard. Proxy sem estado — a Joana Store não guarda dados da
 * encomenda. Porte de api/donate.js (fluxo de doações Frank AI Solutions,
 * já validado em produção com a Debito Pay).
 */
const BASE_URL = process.env.DEBITO_PAY_BASE_URL || 'https://gyqoaningqhurhvdugne.supabase.co/functions/v1'

export type PaymentMethod = 'mpesa' | 'emola' | 'mkesh' | 'visa_mastercard'

// Cada carteira Debito Pay está presa a um único método de pagamento — não
// há um wallet_code partilhado entre M-Pesa e e-Mola, por exemplo.
function walletCodeForMethod(method: PaymentMethod) {
  const byMethod: Record<PaymentMethod, string | undefined> = {
    mpesa: process.env.DEBITO_PAY_WALLET_CODE_MPESA,
    emola: process.env.DEBITO_PAY_WALLET_CODE_EMOLA,
    mkesh: process.env.DEBITO_PAY_WALLET_CODE_MKESH,
    visa_mastercard: process.env.DEBITO_PAY_WALLET_CODE_VISA_MASTERCARD,
  }
  return byMethod[method] || process.env.DEBITO_PAY_WALLET_CODE || ''
}

export function isDebitoPayConfigured() {
  return Boolean(process.env.DEBITO_PAY_API_KEY && process.env.DEBITO_PAY_MERCHANT_ID)
}

interface ChargeInput {
  paymentMethod: PaymentMethod
  amount: number
  currency: string
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  returnUrl?: string
  customerIp?: string | null
}

type ChargeResult =
  | { ok: true; paymentId: string; status: string; checkoutUrl: string | null; reference: string | null }
  | { ok: false; error: string }

export async function chargeDebitoPay(input: ChargeInput): Promise<ChargeResult> {
  const walletCode = walletCodeForMethod(input.paymentMethod)
  if (!walletCode) {
    return { ok: false, error: `Nenhum wallet_code configurado para "${input.paymentMethod}".` }
  }
  if (input.paymentMethod !== 'visa_mastercard' && !input.customerPhone) {
    return { ok: false, error: 'customerPhone é obrigatório para M-Pesa/e-Mola/mKesh.' }
  }

  const res = await fetch(`${BASE_URL}/payment-orchestrator`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEBITO_PAY_API_KEY}`,
      ...(input.customerIp ? { 'X-Customer-IP': input.customerIp } : {}),
    },
    body: JSON.stringify({
      action: 'process',
      payment_method: input.paymentMethod,
      merchant_id: process.env.DEBITO_PAY_MERCHANT_ID,
      wallet_code: walletCode,
      amount: input.amount,
      currency: input.currency,
      source: 'joana-store',
      source_id: input.orderId,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      // M-Pesa/e-Mola/mKesh recusam com "Phone number required" a menos que
      // o campo simples "phone" esteja presente, não só customer_phone.
      ...(input.customerPhone ? { customer_phone: input.customerPhone, phone: input.customerPhone } : {}),
      ...(input.returnUrl ? { return_url: input.returnUrl } : {}),
    }),
  })

  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success) {
    return { ok: false, error: json?.error || 'debitopay_error' }
  }

  return {
    ok: true,
    paymentId: json.payment_id,
    status: json.status,
    checkoutUrl: json.checkout_url || null,
    reference: json.reference || json.transactionId || null,
  }
}

type StatusResult = { ok: true; status: string; reference: string | null } | { ok: false; error: string }

export async function checkDebitoPayStatus(paymentId: string): Promise<StatusResult> {
  const res = await fetch(`${BASE_URL}/payment-orchestrator`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEBITO_PAY_API_KEY}`,
    },
    body: JSON.stringify({ action: 'check-status', payment_id: paymentId }),
  })

  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success) {
    return { ok: false, error: json?.error || 'debitopay_error' }
  }

  return { ok: true, status: json.payment?.status, reference: json.payment?.provider_reference || null }
}
