import { NextRequest } from 'next/server'
import { z } from 'zod'
import { jsonError, jsonOk } from '@/lib/api-response'
import { checkDebitoPayStatus } from '@/lib/debitopay'

const schema = z.object({ payment_id: z.string().min(1) })

/**
 * Consulta o estado de um pagamento pendente (e-Mola/mKesh) via
 * action: "check-status". Usado pelo polling no carrinho enquanto se
 * aguarda a confirmação por callback — sem base de dados, sem webhook
 * obrigatório.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError('Dados inválidos', 422)

  const result = await checkDebitoPayStatus(parsed.data.payment_id)
  if (!result.ok) return jsonError(result.error, 502)

  return jsonOk({ status: result.status, reference: result.reference })
}
