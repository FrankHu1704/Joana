import Link from 'next/link'
import { Facebook, Instagram, MessageCircle, Heart } from 'lucide-react'
import { waLink } from '@/lib/whatsapp'

const WA_MSG = 'Olá Joana Store! Vi o site e quero fazer uma encomenda.'

export function Footer() {
  return (
    <footer className="border-t border-dourado-claro/20 bg-preto text-creme dark:border-preto-suave">
      <div className="container grid grid-cols-2 gap-10 py-14 sm:grid-cols-4">
        <div className="col-span-2">
          <p className="font-display text-xl font-bold">
            Joana <span className="text-rosa-suave-2">Store</span>
          </p>
          <p className="mt-4 max-w-xs text-sm text-creme-2/70">
            Moda masculina, feminina, calçado e acessórios de qualidade, com entrega em todo Moçambique. Encomendas simples, directo pelo WhatsApp.
          </p>
          <div className="mt-5 flex gap-3">
            {[Facebook, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-creme/15 text-creme-2/80 transition hover:border-dourado hover:text-dourado">
                <Icon size={16} />
              </a>
            ))}
            <a href={waLink(WA_MSG)} target="_blank" rel="noopener" className="flex h-10 w-10 items-center justify-center rounded-full border border-creme/15 text-creme-2/80 transition hover:border-emerald-400 hover:text-emerald-400">
              <MessageCircle size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold">Categorias</h4>
          <ul className="mt-4 space-y-3 text-sm text-creme-2/70">
            <li><Link href="/categoria/masculino" className="hover:text-dourado">Masculino</Link></li>
            <li><Link href="/categoria/feminino" className="hover:text-dourado">Feminino</Link></li>
            <li><Link href="/categoria/calcados" className="hover:text-dourado">Calçados</Link></li>
            <li><Link href="/categoria/acessorios" className="hover:text-dourado">Acessórios</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold">Loja</h4>
          <ul className="mt-4 space-y-3 text-sm text-creme-2/70">
            <li><Link href="/produtos" className="hover:text-dourado">Todos os produtos</Link></li>
            <li><Link href="/categoria/promocoes" className="hover:text-dourado">Promoções</Link></li>
            <li><Link href="/categoria/novidades" className="hover:text-dourado">Novidades</Link></li>
            <li><Link href="/favoritos" className="hover:text-dourado">Favoritos</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-creme/10 py-6">
        <div className="container flex flex-col items-center justify-between gap-3 text-xs text-creme-2/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Joana Store. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1.5">
            Feito com <Heart size={13} strokeWidth={2.5} className="fill-rosa-suave-2 text-rosa-suave-2" /> em Moçambique
          </p>
        </div>
        <div className="container mt-3 flex justify-center border-t border-creme/5 pt-3 text-[11px] text-creme-2/40">
          <a href="https://frank-perfil.vercel.app" target="_blank" rel="noopener" className="transition hover:text-dourado">
            by FRANK AI SOLUTIONS
          </a>
        </div>
      </div>
    </footer>
  )
}
