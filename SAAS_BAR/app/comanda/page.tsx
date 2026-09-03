import { createClient } from "@/lib/supabase/server";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { TableCard } from "./table-card";

const LEGEND = [
  { status: "FREE", label: "Livre", dot: "bg-[#3FA34D]" },
  { status: "OCCUPIED", label: "Ocupada", dot: "bg-[#D64545]" },
  { status: "AWAITING_BILL", label: "Aguardando conta", dot: "bg-[#E8791A]" },
  { status: "IDLE", label: "Ociosa", dot: "bg-[#8B948C]" },
];

export default async function ComandaPage() {
  const supabase = await createClient();

  // A RLS já restringe o resultado ao tenant do usuário autenticado —
  // nenhum filtro adicional de tenant_id é necessário aqui.
  const { data: tables, error } = await supabase
    .from("tables")
    .select("id, sector, number, capacity, status")
    .order("sector", { ascending: true })
    .order("number", { ascending: true });

  if (error) {
    return (
      <p className="rounded-lg border border-[#3D2624] bg-[#1A1413] p-4 text-sm text-[#F2A38F]">
        Não foi possível carregar o mapa de mesas. Tente novamente.
      </p>
    );
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="rounded-lg border border-[#262B25] bg-[#171B18] p-6 text-center">
        <p className="text-sm text-[#8B948C]">
          Nenhuma mesa cadastrada ainda. Peça ao administrador para
          configurar a topologia do salão.
        </p>
      </div>
    );
  }

  const sectors = Array.from(new Set(tables.map((t) => t.sector)));

  return (
    <div className="flex flex-col gap-6">
      <RealtimeRefresh tables={["tables"]} channelName="comanda-salao" />
      {/* Legenda de status */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-lg border border-[#262B25] bg-[#171B18] px-3 py-2.5">
        {LEGEND.map((item) => (
          <div key={item.status} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${item.dot}`} />
            <span className="text-[11px] text-[#8B948C]">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Mesas agrupadas por setor */}
      {sectors.map((sector) => (
        <section key={sector} className="flex flex-col gap-2.5">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#8B948C]">
            {sector}
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {tables
              .filter((t) => t.sector === sector)
              .map((table) => (
                <TableCard
                  key={table.id}
                  id={table.id}
                  number={table.number}
                  capacity={table.capacity}
                  status={table.status}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
