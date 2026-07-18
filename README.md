# Joana Store

Loja online 4D premium de moda, calçado e acessórios em Moçambique — inspirada no design da PEP Moçambique, com identidade própria (tons rosa/dourado, tipografia Fraunces + Manrope), glassmorphism, parallax e microinterações.

## Stack

- **Next.js 15** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** + **Framer Motion** + **Swiper.js**
- **Supabase** (Postgres, Auth, RLS) — tabelas prefixadas `store_*`
- **Zustand** para carrinho e favoritos (persistidos em localStorage)
- **Lucide Icons**, **Recharts** (dashboard admin)
- PWA (manifest + service worker leve, sem dependências pesadas)

## ⚠️ Nota importante sobre a base de dados

Este projecto **partilha** o projecto Supabase `Senga` (`vatvdkwuidtstyonwrwl`) com outra aplicação não relacionada. Para evitar qualquer conflito:

- Todas as tabelas da Joana Store têm o prefixo `store_` (`store_products`, `store_categories`, `store_admins`, `store_visitor_sessions`, `store_page_views`, `store_coupons`).
- As tabelas da outra app (`profiles`, `bot_files`, `orders`) **não são tocadas** por este código.
- O acesso de administrador é controlado pela tabela `store_admins` (não pela existência de uma sessão autenticada) — um utilizador de autenticação **só** é administrador da Joana Store se o seu `user_id` estiver em `store_admins`. Isto impede que utilizadores da outra app acedam ao painel `/admin`.
- Não é usada uma `service_role key` — todas as escritas passam pela sessão autenticada do Supabase, protegidas por Row Level Security.

## Configuração

1. Copie `.env.example` para `.env.local` (os valores de `NEXT_PUBLIC_SUPABASE_URL` já apontam para o projecto Supabase partilhado).
2. Preencha `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API no painel Supabase).
3. Instale as dependências e arranque o servidor:
   ```bash
   npm install
   npm run dev
   ```

### Login do administrador

O painel de administração usa **número de telefone + senha** em vez de email (o login em `/admin/login` converte o número internamente para um endereço sintético — `<número>@joanastore.internal` — só para o Supabase Auth conseguir autenticar).

Não existe registo público de administradores. Para criar um novo administrador:

1. No painel Supabase → Authentication → Users, adicione manualmente um utilizador com o email `<número>@joanastore.internal` (ex: `864597500@joanastore.internal`) e a senha desejada.
2. No SQL Editor, execute:
   ```sql
   insert into public.store_admins (user_id, full_name)
   values ('<uuid-do-utilizador>', 'Joana');
   ```
3. Entre em `/admin/login` com o número de telefone e a senha.

A conta da Joana (número `864597500`) já foi criada directamente na base de dados — **a senha nunca é guardada no código-fonte**, apenas na tabela de autenticação do Supabase, para evitar expor a credencial no repositório do GitHub.

## Pagamentos automáticos (Debito Pay)

O checkout nativo (`/carrinho`) pode cobrar automaticamente via M-Pesa/e-Mola/mKesh — push USSD directo para o telemóvel do cliente, sem redireccionar para nenhum site. M-Pesa confirma na hora; e-Mola/mKesh confirmam por callback, por isso o browser faz polling a `/api/debitopay/status` até à confirmação. **Sem base de dados**: `/api/debitopay/checkout` e `/api/debitopay/status` são um proxy sem estado para o `payment-orchestrator` da Debito Pay — a Joana Store não cria nem guarda qualquer registo de encomenda.

1. Preencha `DEBITO_PAY_API_KEY`, `DEBITO_PAY_MERCHANT_ID` e um `DEBITO_PAY_WALLET_CODE_<MÉTODO>` por método de pagamento activo (cada carteira Debito Pay está presa a um único método) no `.env.local` / nas variáveis de ambiente da Vercel.
2. `DEBITO_PAY_WEBHOOK_SECRET` e o registo do endpoint `/api/debitopay/webhook` são **opcionais** — o polling client-side já confirma o pagamento sem precisar de webhook.

Enquanto as variáveis `DEBITO_PAY_*` não estiverem definidas, o botão "Pagar agora" recorre automaticamente ao checkout via WhatsApp.

## Catálogo inicial

O catálogo foi semeado directamente no Supabase (ver secção de migrações abaixo) combinando:

- As 3 novas peças masculinas do pedido actual (Calções, Calças, Camisetas).
- Os 4 produtos originais da Joana Store (Conjunto "Os Dois", Peça Única, Kit 5 Colares, Macacão), agora distribuídos pelas categorias Feminino/Acessórios.

Todas as migrações SQL (esquema, funções, RLS e seed) estão documentadas em `supabase/migrations/` para referência e reprodutibilidade — foram também já aplicadas directamente ao projecto Supabase via MCP.

## Estrutura

```
src/
  app/
    (site)/            # Loja pública: home, /produtos, /categoria/[slug], /produto/[slug], /favoritos, /carrinho
    admin/
      login/            # Login do painel (sem registo público)
      (protected)/       # Dashboard, produtos, categorias, cupões — protegido por store_is_admin()
    api/
      products, categories, coupons/validate, checkout   # Endpoints públicos
      admin/*                                              # Endpoints protegidos (sessão + store_is_admin)
  components/
    site/                # Navbar, hero, product-card, carousels, carrinho, etc.
    admin/                # Sidebar, topbar (com saudação e motivação), gráficos, formulário de produto
    ui/                   # Button, Input, Select, Badge, Textarea
  lib/
    stores/               # Zustand: carrinho e favoritos
    supabase/              # Clientes browser/server/anon + middleware de sessão
    whatsapp.ts             # Construção de mensagens de encomenda via WhatsApp
```

## Funcionalidades

- **Pesquisa inteligente** em tempo real com resultados instantâneos.
- **Filtros** por categoria, preço e novidades/promoções/destaque, com scroll infinito.
- **Favoritos e carrinho** persistidos no dispositivo (sem necessidade de conta de cliente).
- **Pagamento automático via Debito Pay**: no carrinho, "Pagar agora" cobra directamente via M-Pesa/e-Mola/mKesh — push USSD para o telemóvel do cliente, sem redireccionar (`/api/debitopay/checkout` + polling em `/api/debitopay/status`). É um proxy sem estado — a Joana Store não cria nem guarda encomendas na base de dados. Sem as variáveis `DEBITO_PAY_*` configuradas, o botão recorre automaticamente ao checkout via WhatsApp.
- **Checkout via WhatsApp**: alternativa manual — o carrinho é convertido numa mensagem formatada e o pedido é enviado directamente pelo WhatsApp da loja.
- **Cupões de desconto** validados via função segura no Supabase (`store_validate_coupon`).
- **Estatísticas de visitantes**: cada visita é registada (`store_track_view`), alimentando o dashboard administrativo (visitantes totais/hoje, gráfico de visitas, gráfico por categoria, produtos mais vistos/vendidos, últimos acessos).
- **Modo escuro/claro**, **PWA instalável** (botão "Instalar app" quando o navegador suporta), **SEO** (metadata dinâmica, JSON-LD de produto, sitemap.xml, robots.txt).
- **Notificações push**: os clientes podem activar notificações (ícone de sino na navbar) e recebem um alerta sempre que a Joana adiciona um novo produto activo. Requer `NEXT_PUBLIC_VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY` (gere com `npx web-push generate-vapid-keys`).
- **Cupões de desconto com limite de usos** — ex: código `TIKTOK25`, 25% de desconto, limitado a 5 utilizações (já criado como exemplo). Geridos em `/admin/cupoes`.

## Deploy

Pronto para a **Vercel** — configure as variáveis de `.env.example` no painel do projecto e faça deploy. Lembre-se de que o Supabase usado é partilhado; qualquer alteração de esquema deve manter o prefixo `store_`.
