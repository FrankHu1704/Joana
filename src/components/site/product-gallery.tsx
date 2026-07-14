'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Thumbs, FreeMode, Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)

  return (
    <div>
      <Swiper
        modules={[Thumbs, Navigation]}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        navigation
        className="aspect-square overflow-hidden rounded-3xl bg-creme-2 shadow-strong"
      >
        {images.map((img, i) => (
          <SwiperSlide key={img + i}>
            <div className="relative h-full w-full">
              <Image src={img} alt={`${name} — imagem ${i + 1}`} fill priority={i === 0} sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {images.length > 1 && (
        <Swiper
          modules={[Thumbs, FreeMode]}
          onSwiper={setThumbsSwiper}
          freeMode
          watchSlidesProgress
          slidesPerView={4.5}
          spaceBetween={10}
          className="mt-3"
        >
          {images.map((img, i) => (
            <SwiperSlide key={img + i} className="cursor-pointer">
              <div className="relative aspect-square overflow-hidden rounded-xl border-2 border-transparent opacity-70 transition hover:opacity-100 [.swiper-slide-thumb-active_&]:border-rosa-profundo [.swiper-slide-thumb-active_&]:opacity-100">
                <Image src={img} alt="" fill sizes="120px" className="object-cover" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  )
}
