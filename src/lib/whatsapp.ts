import { formatMZN, effectivePrice } from './utils'
import type { Product } from '@/types/database'

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '258864597500'

export function waLink(message: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}

export function buildProductMessage(product: Pick<Product, 'name' | 'price' | 'promo_price' | 'is_promotion'>) {
  const price = effectivePrice(product)
  return `Olá Joana Store! 👋 Quero encomendar: *${product.name}* — ${formatMZN(price)}.`
}

export interface CartLineForMessage {
  name: string
  quantity: number
  price: number
}

export function buildCartMessage(lines: CartLineForMessage[], total: number, couponCode?: string) {
  let msg = 'Olá Joana Store! 👋 Quero finalizar a minha encomenda:\n\n'
  lines.forEach((l) => {
    msg += `• ${l.quantity}x ${l.name} — ${formatMZN(l.price * l.quantity)}\n`
  })
  if (couponCode) msg += `\nCupão aplicado: ${couponCode}`
  msg += `\n*Total: ${formatMZN(total)}*`
  return msg
}
