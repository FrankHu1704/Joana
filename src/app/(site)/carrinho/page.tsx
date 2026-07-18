'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, Tag, MessageCircle } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { formatMZN } from '@/lib/utils'
import { buildCartMessage, waLink } from '@/lib/whatsapp'

export default function CarrinhoPage() {
  const { toast } = useToast()
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clear = useCartStore((s) => s.clear)
  const total = useCartStore((s) => s.total())

  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState<{ code: string; discount_percent: number; discount_amount: number } | null>(null)
  const [validating, setValidating] = useState(false)

  const discount = coupon ? Math.min(total, total * (coupon.discount_percent / 100) + coupon.discount_amount) : 0
  const finalTotal = Math.max(0, total - discount)

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setValidating(true)
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode.trim() }),
    })
    const json = await res.json()
    setValidating(false)

    if (!json?.data?.valid) {
      toast({ title: 'Cupão inválido', description: 'Verifique o código introduzido.', variant: 'error' })
      setCoupon(null)
      return
    }
    setCoupon(json.data)
    toast({ title: 'Cupão aplicado!', description: json.data.code, variant: 'success' })
  }

  async function finalizeOrder() {
    const message = buildCartMessage(items, finalTotal, coupon?.code)
    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_ids: items.map((i) => i.id), coupon_code: coupon?.code }),
    }).catch(() => {})
    window.open(waLink(message), '_blank')
  }

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag size={40} className="text-preto-suave/30" />
        <h1 className="font-display text-2xl font-bold text-preto dark:text-creme">A sua sacola está vazia</h1>
        <p className="text-preto-suave dark:text-creme-2/60">Adicione produtos para começar a sua encomenda.</p>
        <Link href="/produtos">
          <Button variant="primary">Explorar produtos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold text-preto dark:text-creme">A minha sacola</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-dourado-claro/25 bg-white p-4 dark:border-preto-suave/60 dark:bg-preto/60">
              <Link href={`/produto/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-creme-2">
                {item.image && <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/produto/${item.slug}`} className="truncate text-sm font-bold text-preto dark:text-creme">
                  {item.name}
                </Link>
                <p className="mt-1 text-sm font-bold text-rosa-profundo">{formatMZN(item.price)}</p>
              </div>
              <div className="flex items-center rounded-full border border-dourado-claro/40 dark:border-preto-suave">
                <button onClick={() => setQuantity(item.id, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center">
                  <Minus size={14} />
                </button>
                <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                <button onClick={() => setQuantity(item.id, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center">
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-preto-suave/50 hover:text-rosa-profundo">
                <Trash2 size={17} />
              </button>
            </div>
          ))}
          <button onClick={clear} className="text-xs font-bold text-preto-suave/60 hover:text-rosa-profundo">
            Esvaziar sacola
          </button>
        </div>

        <div className="h-fit space-y-5 rounded-2xl border border-dourado-claro/25 bg-white p-6 shadow-soft dark:border-preto-suave/60 dark:bg-preto/60">
          <h2 className="font-display text-lg font-bold">Resumo</h2>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-preto-suave/50" />
              <Input placeholder="Código de cupão" className="pl-9" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            </div>
            <Button variant="outline" onClick={applyCoupon} loading={validating}>
              Aplicar
            </Button>
          </div>

          <div className="space-y-2 border-t border-dourado-claro/20 pt-4 text-sm dark:border-preto-suave/40">
            <div className="flex justify-between text-preto-suave dark:text-creme-2/70">
              <span>Subtotal</span>
              <span>{formatMZN(total)}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-emerald-600">
                <span>Desconto ({coupon.code})</span>
                <span>-{formatMZN(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-dourado-claro/20 pt-2 text-base font-extrabold text-preto dark:border-preto-suave/40 dark:text-creme">
              <span>Total</span>
              <span className="text-rosa-profundo">{formatMZN(finalTotal)}</span>
            </div>
          </div>

          <Button variant="primary" size="lg" className="w-full !bg-emerald-600 hover:!bg-emerald-700" onClick={finalizeOrder}>
            <MessageCircle size={18} /> Finalizar via WhatsApp
          </Button>
          <p className="text-center text-[11px] text-preto-suave/60 dark:text-creme-2/40">
            Ao finalizar, será redireccionado para o WhatsApp para confirmar a sua encomenda.
          </p>
        </div>
      </div>
    </div>
  )
}
