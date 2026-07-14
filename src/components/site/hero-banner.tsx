'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatMZN, effectivePrice, discountPercent } from '@/lib/utils'
import type { Product } from '@/types/database'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

export function HeroBanner({ promotions }: { promotions: Product[] }) {
  const slides = promotions.slice(0, 4)

  return (
    <section className="relative overflow-hidden bg-radial-glow bg-creme dark:bg-surface-dark">
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-rosa-suave/50 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-dourado-claro/40 blur-3xl"
      />

      <div className="container relative py-8 sm:py-12">
        {slides.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop
            className="overflow-hidden rounded-[28px] shadow-strong"
          >
            {slides.map((p) => {
              const price = effectivePrice(p)
              const hasDiscount = p.is_promotion && p.promo_price != null
              return (
                <SwiperSlide key={p.id}>
                  <div className="relative grid min-h-[420px] grid-cols-1 items-center gap-8 bg-preto p-8 sm:min-h-[460px] sm:p-14 lg:grid-cols-2">
                    <div className="relative z-10 text-creme">
                      {hasDiscount && (
                        <span className="inline-block rounded-full bg-rosa-profundo px-4 py-1.5 text-xs font-bold uppercase tracking-wide">
                          -{discountPercent(p.price, p.promo_price!)}% de desconto
                        </span>
                      )}
                      <h1 className="font-display mt-4 text-3xl font-bold leading-tight sm:text-5xl">{p.name}</h1>
                      <div className="mt-4 flex items-baseline gap-3">
                        <span className="text-2xl font-extrabold text-rosa-suave-2 sm:text-3xl">{formatMZN(price)}</span>
                        {hasDiscount && <span className="text-base text-creme-2/50 line-through">{formatMZN(p.price)}</span>}
                      </div>
                      <Link href={`/produto/${p.slug}`} className="mt-8 inline-block">
                        <Button variant="gold" size="lg">
                          Ver produto <ArrowRight size={18} />
                        </Button>
                      </Link>
                    </div>
                    {p.images[0] && (
                      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl shadow-strong lg:mx-0">
                        <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 1024px) 80vw, 480px" className="object-cover" priority />
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
        ) : (
          <div className="rounded-[28px] bg-preto p-14 text-center text-creme shadow-strong">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">Moda que se sente em 4D</h1>
            <p className="mx-auto mt-4 max-w-xl text-creme-2/70">Masculino, feminino, calçado e acessórios — entrega em todo Moçambique.</p>
            <Link href="/produtos" className="mt-8 inline-block">
              <Button variant="gold" size="lg">
                Explorar catálogo <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
