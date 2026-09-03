-- Dono da plataforma (super-admin) — não pertence a nenhum tenant
-- específico, fica acima de todos eles. Deliberadamente separado de
-- `users` (que é "funcionário de um restaurante") pra não misturar os
-- dois modelos de permissão.
create table if not exists platform_admins (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

alter table platform_admins enable row level security;

-- Só o próprio admin consegue se ver — ninguém se autopromove a platform
-- admin escrevendo direto nessa tabela pela anon key (não existe policy de
-- insert/update aqui; isso só é feito manualmente, com a service role).
create policy "self_read_platform_admin" on platform_admins
  for select using (id = auth.uid());

-- Status de assinatura por restaurante — dá suporte a ativar/desativar
-- conta e, no futuro, ao status vindo do gateway de cobrança.
alter table tenants add column if not exists status text not null default 'TRIAL';
alter table tenants add constraint tenants_status_check
  check (status in ('TRIAL', 'ACTIVE', 'SUSPENDED'));

-- Permite que o platform admin enxergue TODOS os tenants, não só o seu —
-- necessário pra listar/ativar contas. Ver dados operacionais de dentro de
-- cada restaurante (pedidos, pagamentos dos clientes deles) é uma decisão
-- à parte, mais sensível, que precisa ser confirmada explicitamente.
create policy "platform_admin_sees_all_tenants" on tenants
  for select using (
    exists (select 1 from platform_admins where id = auth.uid())
  );
