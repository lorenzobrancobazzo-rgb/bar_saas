-- Acesso total do platform admin a todos os tenants — políticas
-- adicionais (permissivas, então se somam via OR às de isolamento por
-- tenant já existentes, sem precisar reescrevê-las).

create policy "platform_admin_full_access_users" on users
  for all using (exists (select 1 from platform_admins where id = auth.uid()))
  with check (exists (select 1 from platform_admins where id = auth.uid()));

create policy "platform_admin_full_access_categories" on categories
  for all using (exists (select 1 from platform_admins where id = auth.uid()))
  with check (exists (select 1 from platform_admins where id = auth.uid()));

create policy "platform_admin_full_access_products" on products
  for all using (exists (select 1 from platform_admins where id = auth.uid()))
  with check (exists (select 1 from platform_admins where id = auth.uid()));

create policy "platform_admin_full_access_tables" on tables
  for all using (exists (select 1 from platform_admins where id = auth.uid()))
  with check (exists (select 1 from platform_admins where id = auth.uid()));

create policy "platform_admin_full_access_orders" on orders
  for all using (exists (select 1 from platform_admins where id = auth.uid()))
  with check (exists (select 1 from platform_admins where id = auth.uid()));

create policy "platform_admin_full_access_order_items" on order_items
  for all using (exists (select 1 from platform_admins where id = auth.uid()))
  with check (exists (select 1 from platform_admins where id = auth.uid()));

create policy "platform_admin_full_access_payments" on payments
  for all using (exists (select 1 from platform_admins where id = auth.uid()))
  with check (exists (select 1 from platform_admins where id = auth.uid()));

create policy "platform_admin_write_tenants" on tenants
  for insert with check (exists (select 1 from platform_admins where id = auth.uid()));

create policy "platform_admin_update_tenants" on tenants
  for update using (exists (select 1 from platform_admins where id = auth.uid()))
  with check (exists (select 1 from platform_admins where id = auth.uid()));
