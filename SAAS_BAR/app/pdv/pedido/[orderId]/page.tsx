import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { CheckoutPanel } from "./checkout-panel";

type OrderDetailRow = Pick<
  Database["public"]["Tables"]["orders"]["Row"],
  "id" | "opened_at" | "service_fee"
> & {
  tables: Pick<Database["public"]["Tables"]["tables"]["Row"], "number" | "sector"> | null;
  order_items: (Pick<
    Database["public"]["Tables"]["order_items"]["Row"],
    "id" | "quantity" | "unit_price" | "status"
  > & {
    products: Pick<Database["public"]["Tables"]["products"]["Row"], "name"> | null;
  })[];
  payments: Pick<
    Database["public"]["Tables"]["payments"]["Row"],
    "id" | "method" | "amount" | "created_at"
  >[];
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const METHOD_LABEL: Record<string, string> = {
  CASH: "Dinheiro",
  DEBIT_CARD: "Débito",
  CREDIT_CARD: "Crédito",
  PIX: "Pix",
  OTHER: "Outro",
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, opened_at, service_fee, tables(number, sector), order_items(id, quantity, unit_price, status, products(name)), payments(id, method, amount, created_at)"
    )
    .eq("id", orderId)
    .single<OrderDetailRow>();

  if (!order) {
    notFound();
  }

  const activeItems = order.order_items.filter(
    (item) => item.status !== "CANCELLED"
  );
  const subtotal = activeItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const serviceFeeAmount = subtotal * (order.service_fee / 100);
  const total = subtotal + serviceFeeAmount;
  const paid = order.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, Math.round((total - paid) * 100) / 100);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <RealtimeRefresh tables={["order_items", "payments"]} channelName={`pdv-pedido-${order.id}`} />
      <div>
        <h1 className="text-lg font-semibold text-[#F5F3EE]">
          Mesa {order.tables?.number.toString().padStart(2, "0") ?? "--"}
        </h1>
        <p className="text-xs text-[#8B948C]">{order.tables?.sector}</p>
      </div>

      {/* Itens consumidos */}
      <section className="rounded-lg border border-[#262B25] bg-[#171B18] p-4">
        <h2 className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#8B948C]">
          Consumo
        </h2>
        <div className="flex flex-col gap-2">
          {activeItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-[#F5F3EE]">
                {item.quantity}x {item.products?.name ?? "Item removido"}
              </span>
              <span className="font-mono text-[#8B948C]">
                {currency.format(item.quantity * item.unit_price)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-1 border-t border-[#232823] pt-3 text-sm">
          <div className="flex justify-between text-[#8B948C]">
            <span>Subtotal</span>
            <span className="font-mono">{currency.format(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#8B948C]">
            <span>Taxa de serviço ({order.service_fee}%)</span>
            <span className="font-mono">{currency.format(serviceFeeAmount)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-[#F5F3EE]">
            <span>Total</span>
            <span className="font-mono">{currency.format(total)}</span>
          </div>
        </div>
      </section>

      {/* Pagamentos já lançados */}
      {order.payments.length > 0 && (
        <section className="rounded-lg border border-[#262B25] bg-[#171B18] p-4">
          <h2 className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#8B948C]">
            Pagamentos lançados
          </h2>
          <div className="flex flex-col gap-1.5">
            {order.payments.map((payment) => (
              <div key={payment.id} className="flex justify-between text-sm">
                <span className="text-[#F5F3EE]">
                  {METHOD_LABEL[payment.method] ?? payment.method}
                </span>
                <span className="font-mono text-[#8B948C]">
                  {currency.format(payment.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <CheckoutPanel orderId={order.id} remaining={remaining} />
    </div>
  );
}