const messages = ['📦 Envios rápidos e seguros', '💬 Atendimento directo via WhatsApp', '✨ Moda masculina, feminina, calçado e acessórios']

export function PromoBar() {
  return (
    <div className="overflow-hidden whitespace-nowrap bg-preto py-2.5 text-[12.5px] font-bold tracking-wide text-dourado-claro">
      <div className="inline-flex animate-marquee">
        {[0, 1].map((i) => (
          <span key={i} className="inline-flex">
            {messages.map((m) => (
              <span key={m} className="inline-flex items-center px-7 after:ml-7 after:content-['✦'] after:text-rosa-suave-2">
                {m}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}
