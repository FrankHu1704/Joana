'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart-store'
import { buildCartMessage, waLink } from '@/lib/whatsapp'

const GENERIC_MSG = 'Olá Joana Store! Vi o site e quero fazer uma encomenda.'

export function WhatsappFloat() {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())

  useEffect(() => setMounted(true), [])

  const href = mounted && items.length > 0 ? waLink(buildCartMessage(items, total)) : waLink(GENERIC_MSG)
  const label = mounted && items.length > 0 ? `Finalizar sacola (${items.length})` : 'Fazer encomenda agora'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-strong transition-all hover:w-auto hover:px-5 hover:gap-2 sm:bottom-6 sm:right-6"
    >
      <MessageCircle size={24} className="shrink-0" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all group-hover:inline group-hover:max-w-xs">
        {label}
      </span>
    </a>
  )
}
