import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { KdsBoard, type KdsItem } from "./kds-board";

type OrderItemRow = Pick<
  Database["public"]["Tables"]["order_items"]["Row"],
  "id" | "quantity" | "notes" | "status" | "sent_at"
> & {
  products: Pick<Database["public"]["Tables"]["products"]["Row"], "name"> | null;
  orders: {
    tables: Pick<Database["public"]["Tables"]["tables"]["Row"], "number" | "sector"> | null;
  } | null;
};

export default async function KdsPage() {
  const supabase = await createClient();

  // RLS já restringe ao tenant do usuário autenticado.
  const { data, error } = await supabase
    .from("order_items")
    .select(
      "id, quantity, notes, status, sent_at, products(name), orders(tables(number, sector))"
    )
    .in("status", ["SENT", "PREPARING", "READY"])
    .order("sent_at", { ascending: true })
    .returns<OrderItemRow[]>();

  if (error) {
    return (
      <p className="rounded-lg border border-[#3D2624] bg-[#1A1413] p-4 text-sm text-[#F2A38F]">
        Não foi possível carregar a fila de produção.
      </p>
    );
  }

  const items: KdsItem[] = (data ?? []).map((row) => ({
    id: row.id,
    quantity: row.quantity,
    notes: row.notes,
    // O .in("status", [...]) acima já garante só esses 3 valores em
    // runtime — o enum completo da coluna inclui DELIVERED/CANCELLED.
    status: row.status as KdsItem["status"],
    sentAt: row.sent_at,
    productName: row.products?.name ?? "Item removido",
    tableNumber: row.orders?.tables?.number ?? null,
    tableSector: row.orders?.tables?.sector ?? null,
  }));

  return (
    <>
      <RealtimeRefresh tables={["order_items"]} channelName="kds-board" />
      <KdsBoard items={items} />
    </>
  );
}