import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { OrderBuilder } from "./order-builder";

export default async function MesaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: table } = await supabase
    .from("tables")
    .select("id, number, sector, capacity, status")
    .eq("id", id)
    .single();

  // RLS impede acesso a mesas de outro tenant, então um resultado vazio
  // aqui significa "não existe" ou "não é sua" — em ambos os casos, 404.
  if (!table) {
    notFound();
  }

  const [{ data: categories }, { data: products }, { data: openOrder }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name")
        .order("display_order", { ascending: true }),
      supabase
        .from("products")
        .select("id, category_id, name, price")
        .eq("is_active", true)
        .order("name", { ascending: true }),
      supabase
        .from("orders")
        .select("id")
        .eq("table_id", id)
        .eq("status", "OPEN")
        .maybeSingle(),
    ]);

  let sentItems: {
    id: string;
    quantity: number;
    unit_price: number;
    notes: string | null;
    status: string;
    products: { name: string } | null;
  }[] = [];

  if (openOrder) {
    const { data } = await supabase
      .from("order_items")
      .select("id, quantity, unit_price, notes, status, products(name)")
      .eq("order_id", openOrder.id)
      .neq("status", "CANCELLED")
      .order("created_at", { ascending: true });

    sentItems = data ?? [];
  }

  return (
    <div className="flex flex-col gap-4">
      <RealtimeRefresh tables={["order_items"]} channelName={`mesa-${table.id}`} />
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-[#F5F3EE]">
          Mesa {table.number.toString().padStart(2, "0")}
        </h1>
        <p className="text-xs text-[#8B948C]">
          {table.sector} · {table.capacity} lugares
        </p>
      </div>

      <OrderBuilder
        tableId={table.id}
        categories={categories ?? []}
        products={products ?? []}
        sentItems={sentItems}
      />
    </div>
  );
}