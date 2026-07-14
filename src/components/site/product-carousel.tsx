'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation } from 'swiper/modules'
import { ProductCard } from './product-card'
import type { Product } from '@/types/database'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'

export function ProductCarousel({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <Swiper
      modules={[FreeMode, Navigation]}
      freeMode
      navigation
      spaceBetween={16}
      slidesPerView={2.2}
      breakpoints={{
        640: { slidesPerView: 2.5 },
        768: { slidesPerView: 3.2 },
        1024: { slidesPerView: 4.2 },
        1280: { slidesPerView: 5 },
      }}
      className="!px-1 !py-2"
    >
      {products.map((p, i) => (
        <SwiperSlide key={p.id}>
          <ProductCard product={p} priority={i < 3} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
