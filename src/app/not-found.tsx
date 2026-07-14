import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-creme px-6 text-center dark:bg-surface-dark">
      <p className="font-display text-7xl font-bold text-rosa-profundo">404</p>
      <h1 className="font-display text-2xl font-bold text-preto dark:text-creme">Página não encontrada</h1>
      <p className="max-w-sm text-preto-suave dark:text-creme-2/70">O que procura pode ter sido removido ou já não está disponível.</p>
      <Link href="/">
        <Button variant="primary">Voltar à loja</Button>
      </Link>
    </div>
  )
}
