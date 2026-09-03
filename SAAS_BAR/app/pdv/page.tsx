import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { RealtimeRefresh } from "@/components/realtime-refresh";

type OpenOrderRow = Pick<
  Database["public"]["Tables"]["orders"]["Row"],
  "id" | "opened_at" | "service_fee"
> & {
  tables: Pick<Database["public"]["Tables"]["tables"]["Row"], "number" | "sector"> | null;
  order_items: Pick<
    Database["public"]["Tables"]["order_items"]["Row"],
    "quantity" | "unit_price" | "status"
  >[];
  payments: Pick<Database["public"]["Tables"]["payments"]["Row"], "amount">[];
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default async function PdvPage() {
  const supabase = await createClient();

  // RLS já restringe ao tenant do usuário autenticado.
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, opened_at, service_fee, tables(number, sector), order_items(quantity, unit_price, status), payments(amount)"
    )
    .eq("status", "OPEN")
    .order("opened_at", { ascending: true })
    .returns<OpenOrderRow[]>();

  if (error) {
    return (
      <p className="rounded-lg border border-[#3D2624] bg-[#1A1413] p-4 text-sm text-[#F2A38F]">
        Não foi possível carregar as contas em aberto.
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-[#262B25] bg-[#171B18] p-6 text-center">
        <RealtimeRefresh tables={["orders"]} channelName="pdv-listagem" />
        <p className="text-sm text-[#8B948C]">
          Nenhuma comanda em aberto no momento.
        </p>
      </div>
    );
  }

  const orders = data.map((order) => {
    const subtotal = order.order_items
      .filter((item) => item.status !== "CANCELLED")
      .reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const serviceFeeAmount = subtotal * (order.service_fee / 100);
    const total = subtotal + serviceFeeAmount;
    const paid = order.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, total - paid);

    return {
      id: order.id,
      tableNumber: order.tables?.number ?? null,
      tableSector: order.tables?.sector ?? null,
      total,
      paid,
      remaining,
    };
  });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <RealtimeRefresh tables={["orders", "order_items", "payments"]} channelName="pdv-listagem" />
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/pdv/pedido/${order.id}`}
          className="flex flex-col gap-2 rounded-lg border border-[#262B25] bg-[#171B18] p-4 transition-colors hover:border-[#E8791A]/50"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-lg font-semibold text-[#F5F3EE]">
              Mesa {order.tableNumber?.toString().padStart(2, "0") ?? "--"}
            </span>
            {order.remaining === 0 && order.paid > 0 && (
              <span className="rounded-full bg-[#14231A] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#3FA34D]">
                Quitada
              </span>
            )}
          </div>
          <p className="text-xs text-[#8B948C]">{order.tableSector}</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-[11px] text-[#8B948C]">Total</p>
              <p className="font-mono text-sm text-[#F5F3EE]">
                {currency.format(order.total)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#8B948C]">Restante</p>
              <p className="font-mono text-sm font-semibold text-[#E8791A]">
                {currency.format(order.remaining)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}