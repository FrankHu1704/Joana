'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 500)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Voltar ao topo"
      className={cn(
        'fixed bottom-24 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-dourado-claro/40 bg-white/90 text-preto shadow-soft backdrop-blur transition-all dark:border-preto-suave dark:bg-preto/90 dark:text-creme sm:bottom-28 sm:right-6',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      )}
    >
      <ArrowUp size={18} />
    </button>
  )
}
