'use client'

import { useEffect, useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { isPushSupported, getExistingSubscription, subscribeToPush, unsubscribeFromPush } from '@/lib/push/client'
import { useToast } from '@/hooks/use-toast'

export function NotificationToggle({ className }: { className?: string }) {
  const { toast } = useToast()
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isPushSupported()) return
    setSupported(true)
    getExistingSubscription().then((sub) => setSubscribed(!!sub))
  }, [])

  async function handleClick() {
    setLoading(true)
    try {
      if (subscribed) {
        await unsubscribeFromPush()
        setSubscribed(false)
        toast({ title: 'Notificações desactivadas', variant: 'info' })
      } else {
        const ok = await subscribeToPush()
        setSubscribed(ok)
        if (ok) toast({ title: 'Notificações activadas!', description: 'Vai receber alertas de novos produtos.', variant: 'success' })
        else toast({ title: 'Não foi possível activar', description: 'Verifique as permissões do navegador.', variant: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={subscribed ? 'Desactivar notificações' : 'Activar notificações de novos produtos'}
      title={subscribed ? 'Notificações activas' : 'Activar notificações de novos produtos'}
      className={className ?? 'flex h-10 w-10 items-center justify-center rounded-full border border-dourado-claro/40 text-preto-suave transition hover:bg-rosa-suave/40 disabled:opacity-50 dark:border-preto-suave dark:text-creme-2'}
    >
      {subscribed ? <BellRing size={17} className="text-rosa-profundo" /> : <Bell size={17} />}
    </button>
  )
}
