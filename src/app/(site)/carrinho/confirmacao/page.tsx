'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart-store'
import { Button } from '@/components/ui/button'

/**
 * Página de retorno do DebitoPay (return_url). Apenas informa o cliente e
 * limpa a sacola local — a Joana Store não guarda encomendas nem consulta
 * o estado do pagamento; a confirmação é feita pela própria DebitoPay.
 */
export default function ConfirmacaoPage() {
  const clear = useCartStore((s) => s.clear)

  useEffect(() => {
    clear()
  }, [clear])

  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <CheckCircle2 size={48} className="text-emerald-500" />
      <h1 className="font-display text-2xl font-bold text-preto dark:text-creme">Obrigado pelo seu pagamento</h1>
      <p className="max-w-md text-preto-suave dark:text-creme-2/60">
        O seu pagamento foi processado pela DebitoPay. Se tiver alguma dúvida sobre a sua encomenda, contacte-nos pelo
        WhatsApp.
      </p>
      <Link href="/produtos">
        <Button variant="primary">Continuar a comprar</Button>
      </Link>
    </div>
  )
}
