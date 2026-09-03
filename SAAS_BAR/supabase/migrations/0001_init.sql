-- ⚠️ Reconstruído a partir do uso real das queries no código-fonte, já que
-- o projeto não tinha nenhuma migration versionada. Rode isso no SQL
-- Editor do Supabase (ou via `supabase db push`) num projeto novo, ANTES
-- de tentar rodar `supabase gen types typescript`.
--
-- Depois de aplicar, habilite Realtime nas 4 tabelas que o app escuta:
--   ALTER PUBLICATION supabase_realtime ADD TABLE order_items, orders, tables, payments;

create extension if not exists "pgcrypto";

-- ───────────────────────────── tenants ─────────────────────────────
-- Não referenciada diretamente por nenhuma query do código hoje, mas
-- tenant_id é FK em todas as outras tabelas — precisa existir.
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- ────────────────────────────── enums ───────────────────────────────
do $$ begin
  create type user_role as enum ('ADMIN', 'CASHIER', 'KITCHEN', 'WAITER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type table_status as enum ('FREE', 'OCCUPIED', 'AWAITING_BILL', 'IDLE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('OPEN', 'CLOSED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_item_status as enum ('SENT', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'PIX', 'OTHER');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────── users ──────────────────────────────
-- Espelha auth.users 1:1 (id igual) — é a tabela que carrega tenant_id e role.
create table if not exists users (
  id uuid primary key references auth.users (id) on delete cascade,
  tenant_id uuid not null references tenants (id) on delete cascade,
  role user_role not null,
  full_name text not null
);

-- ────────────────────────────── categories ──────────────────────────
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  name text not null,
  display_order integer not null default 0
);

-- ─────────────────────────────── products ───────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  category_id uuid not null references categories (id) on delete restrict,
  name text not null,
  price numeric(10, 2) not null check (price > 0),
  is_active boolean not null default true
);

-- ──────────────────────────────── tables ────────────────────────────
create table if not exists tables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  number integer not null,
  sector text not null,
  capacity integer not null check (capacity > 0),
  status table_status not null default 'FREE',
  unique (tenant_id, number)
);

-- ──────────────────────────────── orders ────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  table_id uuid not null references tables (id) on delete restrict,
  waiter_id uuid not null references users (id) on delete restrict,
  status order_status not null default 'OPEN',
  service_fee numeric(5, 2) not null default 10,
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

-- ────────────────────────────── order_items ─────────────────────────
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid not null references products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price > 0),
  notes text,
  status order_item_status not null default 'SENT',
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────── payments ───────────────────────────
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  method payment_method not null,
  amount numeric(10, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_categories_tenant on categories (tenant_id);
create index if not exists idx_products_tenant on products (tenant_id);
create index if not exists idx_products_category on products (category_id);
create index if not exists idx_tables_tenant on tables (tenant_id);
create index if not exists idx_orders_tenant on orders (tenant_id);
create index if not exists idx_orders_table on orders (table_id, status);
create index if not exists idx_order_items_order on order_items (order_id);
create index if not exists idx_payments_order on payments (order_id);

-- ═══════════════════════════════ RLS ═══════════════════════════════
-- Todo o código do app assume (nos comentários) que "a RLS já restringe
-- ao tenant" — mas essa política nunca existia no banco. Isso abaixo é o
-- que faz essa suposição virar verdade.

create or replace function my_tenant_id()
returns uuid
language sql
security definer
stable
as $$
  select tenant_id from users where id = auth.uid();
$$;

alter table tenants enable row level security;
alter table users enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table tables enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;

create policy "tenant_isolation_users" on users
  for all using (tenant_id = my_tenant_id());

create policy "tenant_isolation_categories" on categories
  for all using (tenant_id = my_tenant_id()) with check (tenant_id = my_tenant_id());

create policy "tenant_isolation_products" on products
  for all using (tenant_id = my_tenant_id()) with check (tenant_id = my_tenant_id());

create policy "tenant_isolation_tables" on tables
  for all using (tenant_id = my_tenant_id()) with check (tenant_id = my_tenant_id());

create policy "tenant_isolation_orders" on orders
  for all using (tenant_id = my_tenant_id()) with check (tenant_id = my_tenant_id());

-- order_items e payments não têm tenant_id próprio — herdam via order_id.
create policy "tenant_isolation_order_items" on order_items
  for all using (
    order_id in (select id from orders where tenant_id = my_tenant_id())
  ) with check (
    order_id in (select id from orders where tenant_id = my_tenant_id())
  );

create policy "tenant_isolation_payments" on payments
  for all using (
    order_id in (select id from orders where tenant_id = my_tenant_id())
  ) with check (
    order_id in (select id from orders where tenant_id = my_tenant_id())
  );

-- tenants: cada usuário só vê o próprio tenant (não há tela de criar
-- tenant no app ainda — isso seria feito manualmente no onboarding).
create policy "tenant_isolation_tenants" on tenants
  for select using (id = my_tenant_id());
