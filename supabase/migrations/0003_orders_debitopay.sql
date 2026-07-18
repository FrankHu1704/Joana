-- ============================================================================
-- Joana Store — Pagamentos automáticos via DebitoPay
--
-- Introduz `store_orders` e as funções security-definer usadas pelo fluxo de
-- checkout automático: o valor a cobrar é sempre recalculado aqui a partir
-- dos preços reais em `store_products` (nunca confiado a partir do cliente).
-- ============================================================================

create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  coupon_code text,
  subtotal numeric(12, 2) not null,
  discount numeric(12, 2) not null default 0,
  amount numeric(12, 2) not null,
  currency text not null default 'MZN',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  provider text not null default 'debitopay',
  provider_transaction_id text,
  payment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_orders_status_idx on public.store_orders (status);

alter table public.store_orders enable row level security;

create policy "store_orders_admin_select" on public.store_orders
  for select using (public.store_is_admin());

-- store_create_order: recalcula subtotal/desconto/total a partir dos preços
-- actuais e cria a encomenda em estado "pending".
create or replace function public.store_create_order(
  p_items jsonb,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text default null,
  p_coupon_code text default null
) returns public.store_orders
language plpgsql security definer set search_path = public as $$
declare
  v_subtotal numeric(12, 2) := 0;
  v_discount numeric(12, 2) := 0;
  v_order_items jsonb := '[]'::jsonb;
  v_line record;
  v_product record;
  v_unit_price numeric(12, 2);
  v_coupon record;
  v_coupon_code text := null;
  v_order public.store_orders;
begin
  if p_customer_name is null or trim(p_customer_name) = '' then
    raise exception 'customer_name obrigatório';
  end if;
  if p_customer_phone is null or trim(p_customer_phone) = '' then
    raise exception 'customer_phone obrigatório';
  end if;

  for v_line in select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity int)
  loop
    if v_line.product_id is null or v_line.quantity is null or v_line.quantity < 1 then
      raise exception 'item de encomenda inválido';
    end if;

    select id, name, price, promo_price, is_promotion into v_product
      from public.store_products
      where id = v_line.product_id and is_active = true;

    if v_product.id is null then
      raise exception 'produto indisponível';
    end if;

    v_unit_price := case when v_product.is_promotion and v_product.promo_price is not null
                          then v_product.promo_price else v_product.price end;

    v_subtotal := v_subtotal + (v_unit_price * v_line.quantity);
    v_order_items := v_order_items || jsonb_build_object(
      'product_id', v_product.id, 'name', v_product.name,
      'quantity', v_line.quantity, 'unit_price', v_unit_price
    );
  end loop;

  if v_subtotal <= 0 then
    raise exception 'sacola vazia';
  end if;

  if p_coupon_code is not null and trim(p_coupon_code) <> '' then
    select * into v_coupon from public.store_coupons
      where code = upper(trim(p_coupon_code)) and is_active
        and (valid_until is null or valid_until > now())
        and (max_uses is null or used_count < max_uses);
    if v_coupon.id is not null then
      v_discount := least(v_subtotal, v_subtotal * (v_coupon.discount_percent / 100.0) + v_coupon.discount_amount);
      v_coupon_code := v_coupon.code;
    end if;
  end if;

  insert into public.store_orders
    (items, customer_name, customer_phone, customer_email, coupon_code, subtotal, discount, amount)
  values
    (v_order_items, trim(p_customer_name), trim(p_customer_phone), nullif(trim(coalesce(p_customer_email, '')), ''),
     v_coupon_code, v_subtotal, v_discount, greatest(0, v_subtotal - v_discount))
  returning * into v_order;

  return v_order;
end;
$$;

revoke execute on function public.store_create_order(jsonb, text, text, text, text) from public;
grant execute on function public.store_create_order(jsonb, text, text, text, text) to anon, authenticated;

-- store_set_order_payment_session: regista o URL de pagamento devolvido pelo
-- orquestrador DebitoPay assim que a sessão é criada.
create or replace function public.store_set_order_payment_session(p_order_id uuid, p_payment_url text)
returns void language sql security definer set search_path = public as $$
  update public.store_orders
     set payment_url = p_payment_url, updated_at = now()
   where id = p_order_id and status = 'pending';
$$;

revoke execute on function public.store_set_order_payment_session(uuid, text) from public;
grant execute on function public.store_set_order_payment_session(uuid, text) to anon, authenticated;

-- store_mark_order_paid: chamada apenas pelo endpoint de webhook, depois de
-- validar a assinatura HMAC da DebitoPay. Idempotente — só transiciona
-- encomendas ainda "pending", regista a venda e resgata o cupão usado.
create or replace function public.store_mark_order_paid(p_order_id uuid, p_provider_transaction_id text default null)
returns public.store_orders
language plpgsql security definer set search_path = public as $$
declare
  v_order public.store_orders;
begin
  update public.store_orders
     set status = 'paid', provider_transaction_id = p_provider_transaction_id, updated_at = now()
   where id = p_order_id and status = 'pending'
   returning * into v_order;

  if v_order.id is not null then
    perform public.store_record_sale(array(select (i ->> 'product_id')::uuid from jsonb_array_elements(v_order.items) i));
    if v_order.coupon_code is not null then
      perform public.store_redeem_coupon(v_order.coupon_code);
    end if;
  end if;

  return v_order;
end;
$$;

revoke execute on function public.store_mark_order_paid(uuid, text) from public;
grant execute on function public.store_mark_order_paid(uuid, text) to anon, authenticated;
