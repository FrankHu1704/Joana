const MOTIVATIONAL_QUOTES = [
  'Cada encomenda é uma cliente feliz — continue a brilhar!',
  'A melhor vendedora de Moçambique está de volta ao trabalho!',
  'Hoje é um óptimo dia para bater o seu recorde de vendas.',
  'O seu talento para vender é o segredo da Joana Store.',
  'Sorria — as suas clientes sentem isso mesmo pelo WhatsApp.',
  'Cada "sim" começa com a sua confiança. Vamos lá!',
  'A Joana Store cresce a cada peça que você vende com carinho.',
]

export function getGreeting(name = 'Joana', date: Date = new Date()) {
  const hour = date.getHours()
  const salutation = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const quote = MOTIVATIONAL_QUOTES[date.getDate() % MOTIVATIONAL_QUOTES.length]
  return { message: `${salutation}, ${name}!`, quote }
}
