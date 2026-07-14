'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Menu, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/theme-toggle'
import { getGreeting } from '@/lib/greeting'

export function AdminTopbar({ onMenuClick, fullName }: { onMenuClick: () => void; fullName: string }) {
  const router = useRouter()
  const { message, quote } = getGreeting(fullName)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-dourado-claro/25 bg-creme/90 backdrop-blur dark:border-preto-suave/60 dark:bg-surface-dark/90">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="text-preto-suave lg:hidden">
            <Menu size={22} />
          </button>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-preto dark:text-creme">{message}</p>
            <p className="flex items-center gap-1 text-xs text-dourado">
              <Sparkles size={12} /> {quote}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-full border border-dourado-claro/40 px-4 py-2 text-xs font-bold text-preto-suave transition hover:bg-rosa-suave/30 dark:border-preto-suave dark:text-creme-2">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>
      <div className="border-t border-dourado-claro/15 px-4 py-2 text-xs text-preto-suave dark:border-preto-suave/40 dark:text-creme-2/60 sm:hidden">
        {message} · {quote}
      </div>
    </header>
  )
}
