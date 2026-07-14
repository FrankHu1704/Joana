import type { Metadata, Viewport } from 'next'
import { Fraunces, Manrope } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/hooks/use-toast'
import { PwaRegister } from '@/components/pwa-register'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: 'Joana Store — Moda, Acessórios & Calçado', template: '%s | Joana Store' },
  description:
    'Joana Store: moda masculina, feminina, calçado e acessórios em Moçambique. Novidades, promoções e encomendas rápidas via WhatsApp.',
  manifest: '/manifest.json',
  icons: { icon: '/icons/icon.svg', apple: '/icons/icon.svg' },
  openGraph: {
    type: 'website',
    siteName: 'Joana Store',
    title: 'Joana Store — Moda, Acessórios & Calçado',
    description: 'Moda masculina, feminina, calçado e acessórios em Moçambique.',
  },
}

export const viewport: Viewport = {
  themeColor: '#C24A6B',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('joana-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-MZ" className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
        <PwaRegister />
      </body>
    </html>
  )
}
