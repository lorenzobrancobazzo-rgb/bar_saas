-- Achado da auditoria: nada impedia que um pedido fosse criado com
-- table_id de OUTRO tenant (a RLS só valida orders.tenant_id = seu
-- tenant, não que a mesa referenciada pertence a esse mesmo tenant).
create or replace function check_order_table_tenant()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from tables
    where id = new.table_id and tenant_id = new.tenant_id
  ) then
    raise exception 'A mesa informada não pertence a este estabelecimento.';
  end if;
  return new;
end;
$$;

create trigger trg_check_order_table_tenant
  before insert or update on orders
  for each row execute function check_order_table_tenant();
