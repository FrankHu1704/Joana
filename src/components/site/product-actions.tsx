'use client'

import { useEffect, useState } from 'react'
import { Heart, Minus, Plus, MessageCircle, Share2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/stores/cart-store'
import { useFavoritesStore } from '@/lib/stores/favorites-store'
import { useToast } from '@/hooks/use-toast'
import { cn, effectivePrice } from '@/lib/utils'
import { buildProductMessage, waLink } from '@/lib/whatsapp'
import type { Product } from '@/types/database'

export function ProductActions({ product }: { product: Product }) {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const addToCart = useCartStore((s) => s.addItem)
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id))
  const toggleFavorite = useFavoritesStore((s) => s.toggle)

  useEffect(() => setMounted(true), [])

  const price = effectivePrice(product)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: product.name, url })
      } catch {
        // user cancelled — no-op
      }
      return
    }
    await navigator.clipboard.writeText(url)
    toast({ title: 'Link copiado', description: 'O link do produto foi copiado.', variant: 'success' })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-dourado-claro/40 dark:border-preto-suave">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center text-preto-suave dark:text-creme-2">
            <Minus size={15} />
          </button>
          <span className="w-8 text-center text-sm font-bold">{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} className="flex h-11 w-11 items-center justify-center text-preto-suave dark:text-creme-2">
            <Plus size={15} />
          </button>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={() => {
            addToCart({ id: product.id, slug: product.slug, name: product.name, price, image: product.images[0] ?? '' }, quantity)
            toast({ title: 'Adicionado à sacola', description: `${quantity}x ${product.name}`, variant: 'success' })
          }}
        >
          <ShoppingBag size={18} /> Adicionar à sacola
        </Button>
      </div>

      <div className="flex gap-3">
        <a href={waLink(buildProductMessage(product))} target="_blank" rel="noopener" className="flex-1">
          <Button variant="dark" size="lg" className="w-full !bg-emerald-600 hover:!bg-emerald-700">
            <MessageCircle size={18} /> Comprar via WhatsApp
          </Button>
        </a>
        <Button variant="outline" size="icon" className="h-14 w-14 shrink-0" onClick={() => toggleFavorite(product.id)} aria-label="Favoritar">
          <Heart size={19} className={cn(mounted && isFavorite && 'fill-rosa-profundo text-rosa-profundo')} />
        </Button>
        <Button variant="outline" size="icon" className="h-14 w-14 shrink-0" onClick={handleShare} aria-label="Partilhar">
          <Share2 size={18} />
        </Button>
      </div>
    </div>
  )
}
