import { createClient } from "@/lib/supabase/server";
import { createTenant, updateTenantStatus } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  TRIAL: "Em teste",
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
};

const STATUS_COLOR: Record<string, string> = {
  TRIAL: "bg-[#3D2E1B] text-[#E8B58A]",
  ACTIVE: "bg-[#1A2E1C] text-[#3FA34D]",
  SUSPENDED: "bg-[#1A1413] text-[#F2A38F]",
};

export default async function SuperadminPage() {
  const supabase = await createClient();

  const { data: tenants } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <section className="rounded-xl border border-[#262B25] bg-[#171B18] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#8B948C]">
          Cadastrar novo restaurante
        </h2>
        <form action={createTenant} className="flex gap-3">
          <input
            name="name"
            type="text"
            placeholder="Nome do restaurante"
            required
            className="flex-1 rounded-lg border border-[#262B25] bg-[#171B18] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#E8791A] px-4 py-2 text-sm font-semibold text-[#171205] transition hover:opacity-90"
          >
            + Adicionar
          </button>
        </form>
        <p className="mt-2 text-xs text-[#5B635C]">
          Isso só cria o registro do restaurante. O primeiro usuário ADMIN
          dele ainda precisa ser criado manualmente no Supabase Auth e
          vinculado à tabela `users` com este tenant_id — automatizar esse
          convite é o próximo passo natural aqui.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#8B948C]">
          Restaurantes cadastrados ({tenants?.length ?? 0})
        </h2>

        {!tenants || tenants.length === 0 ? (
          <p className="rounded-lg border border-[#262B25] bg-[#171B18] p-6 text-center text-sm text-[#5B635C]">
            Nenhum restaurante cadastrado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between rounded-lg border border-[#262B25] bg-[#171B18] p-4"
              >
                <div>
                  <p className="text-sm font-medium">{tenant.name}</p>
                  <p className="text-xs text-[#5B635C]">
                    Criado em {new Date(tenant.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[tenant.status]}`}
                  >
                    {STATUS_LABEL[tenant.status]}
                  </span>
                  <form action={updateTenantStatus} className="flex gap-1">
                    <input type="hidden" name="id" value={tenant.id} />
                    {tenant.status !== "ACTIVE" && (
                      <button
                        type="submit"
                        name="status"
                        value="ACTIVE"
                        className="rounded-md bg-[#1A2E1C] px-2 py-1 text-xs text-[#3FA34D] transition hover:opacity-80"
                      >
                        Ativar
                      </button>
                    )}
                    {tenant.status !== "SUSPENDED" && (
                      <button
                        type="submit"
                        name="status"
                        value="SUSPENDED"
                        className="rounded-md bg-[#1A1413] px-2 py-1 text-xs text-[#F2A38F] transition hover:opacity-80"
                      >
                        Suspender
                      </button>
                    )}
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
