'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { AdminSidebar } from './sidebar'
import { AdminTopbar } from './topbar'

export function AdminShell({ fullName, children }: { fullName: string; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-creme-2/50 dark:bg-surface-dark">
      <aside className="hidden w-64 shrink-0 border-r border-dourado-claro/25 bg-white dark:border-preto-suave/60 dark:bg-preto lg:block">
        <AdminSidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-preto/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-preto">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 text-preto-suave">
              <X size={20} />
            </button>
            <AdminSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar onMenuClick={() => setMobileOpen(true)} fullName={fullName} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
