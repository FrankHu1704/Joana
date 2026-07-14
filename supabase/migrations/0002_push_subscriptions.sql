-- ============================================================================
-- Joana Store — Web Push subscriptions (notify customers on new products)
-- ============================================================================

create table if not exists public.store_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.store_push_subscriptions enable row level security;

-- Only admins (broadcasting a "new product" notification) can list
-- subscriptions directly; anon customers subscribe/unsubscribe exclusively
-- through the security-definer functions below.
create policy "store_push_subscriptions_admin_select" on public.store_push_subscriptions
  for select using (public.store_is_admin());

create or replace function public.store_subscribe_push(p_endpoint text, p_p256dh text, p_auth text)
returns void language sql security definer set search_path = public as $$
  insert into public.store_push_subscriptions (endpoint, p256dh, auth)
  values (p_endpoint, p_p256dh, p_auth)
  on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth;
$$;

create or replace function public.store_unsubscribe_push(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from public.store_push_subscriptions where endpoint = p_endpoint;
$$;

revoke execute on function public.store_subscribe_push(text, text, text) from public;
grant execute on function public.store_subscribe_push(text, text, text) to anon, authenticated;

revoke execute on function public.store_unsubscribe_push(text) from public;
grant execute on function public.store_unsubscribe_push(text) to anon, authenticated;
