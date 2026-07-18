'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart-store'
import { Button } from '@/components/ui/button'

/**
 * Página de retorno do DebitoPay (return_url). A confirmação definitiva do
 * pagamento acontece de forma assíncrona via webhook — esta página apenas
 * informa o cliente e limpa a sacola local.
 */
export default function ConfirmacaoPage() {
  const clear = useCartStore((s) => s.clear)

  useEffect(() => {
    clear()
  }, [clear])

  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <CheckCircle2 size={48} className="text-emerald-500" />
      <h1 className="font-display text-2xl font-bold text-preto dark:text-creme">Pagamento em processamento</h1>
      <p className="max-w-md text-preto-suave dark:text-creme-2/60">
        Recebemos o seu pedido de pagamento. Assim que a DebitoPay confirmar a transacção, a sua encomenda é
        automaticamente marcada como paga.
      </p>
      <Link href="/produtos">
        <Button variant="primary">Continuar a comprar</Button>
      </Link>
    </div>
  )
}
