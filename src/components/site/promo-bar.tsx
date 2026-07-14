import { Package, MessageCircle, Sparkles, Diamond, type LucideIcon } from 'lucide-react'

const messages: { icon: LucideIcon; text: string }[] = [
  { icon: Package, text: 'Envios rápidos e seguros' },
  { icon: MessageCircle, text: 'Atendimento directo via WhatsApp' },
  { icon: Sparkles, text: 'Moda masculina, feminina, calçado e acessórios' },
]

export function PromoBar() {
  return (
    <div className="overflow-hidden whitespace-nowrap bg-preto py-2.5 text-[12.5px] font-bold tracking-wide text-dourado-claro">
      <div className="inline-flex animate-marquee">
        {[0, 1].map((i) => (
          <span key={i} className="inline-flex">
            {messages.map((m) => (
              <span key={m.text} className="inline-flex items-center gap-2 px-7">
                <m.icon size={13} strokeWidth={2.25} />
                {m.text}
                <Diamond size={8} strokeWidth={2} className="ml-7 fill-rosa-suave-2 text-rosa-suave-2" />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}
