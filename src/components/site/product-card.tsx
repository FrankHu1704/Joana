'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useFavoritesStore } from '@/lib/stores/favorites-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { useToast } from '@/hooks/use-toast'
import { formatMZN, effectivePrice, discountPercent, cn } from '@/lib/utils'
import { buildProductMessage, waLink } from '@/lib/whatsapp'
import type { Product } from '@/types/database'

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id))
  const toggleFavorite = useFavoritesStore((s) => s.toggle)
  const addToCart = useCartStore((s) => s.addItem)

  useEffect(() => setMounted(true), [])

  const price = effectivePrice(product)
  const hasDiscount = product.is_promotion && product.promo_price != null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35 }}
      className="group relative overflow-hidden rounded-2xl border border-dourado-claro/25 bg-white shadow-soft transition-shadow hover:shadow-strong dark:border-preto-suave/60 dark:bg-preto/70"
    >
      <div className="relative aspect-square overflow-hidden bg-creme-2">
        <Link href={`/produto/${product.slug}`} className="block h-full w-full">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </Link>
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.is_promotion && <Badge variant="promo">Promoção</Badge>}
          {product.is_new && <Badge variant="new">Novo</Badge>}
          {product.is_featured && <Badge variant="gold">Destaque</Badge>}
        </div>
        {hasDiscount && (
          <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-lg bg-preto/85 px-2 py-1 text-[11px] font-bold text-creme">
            -{discountPercent(product.price, product.promo_price!)}%
          </span>
        )}
        <button
          onClick={() => {
            toggleFavorite(product.id)
            toast({ title: isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos', variant: 'success' })
          }}
          aria-label="Favoritar"
          className="absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-preto shadow-soft backdrop-blur transition hover:scale-110 dark:bg-preto/80 dark:text-creme"
        >
          <Heart size={16} className={cn(mounted && isFavorite && 'fill-rosa-profundo text-rosa-profundo')} />
        </button>
      </div>

      <div className="p-4">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold text-preto dark:text-creme">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-rosa-profundo">{formatMZN(price)}</span>
          {hasDiscount && <span className="text-xs text-preto-suave/50 line-through">{formatMZN(product.price)}</span>}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              addToCart({ id: product.id, slug: product.slug, name: product.name, price, image: product.images[0] ?? '' })
              toast({ title: 'Adicionado à sacola', description: product.name, variant: 'success' })
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-preto py-2.5 text-xs font-bold text-creme transition hover:bg-preto-suave dark:bg-creme dark:text-preto"
          >
            <ShoppingBag size={14} /> Comprar
          </button>
          <a
            href={waLink(buildProductMessage(product))}
            target="_blank"
            rel="noopener"
            onClick={(e) => e.stopPropagation()}
            aria-label="Comprar via WhatsApp"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600"
          >
            <MessageCircle size={16} />
          </a>
        </div>
      </div>
    </motion.div>
  )
}
