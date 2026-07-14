'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label="Alternar tema"
      className={className ?? 'flex h-10 w-10 items-center justify-center rounded-full border border-dourado-claro/40 text-preto-suave transition hover:bg-rosa-suave/40 dark:border-preto-suave dark:text-creme-2 dark:hover:bg-preto-suave/40'}
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}
