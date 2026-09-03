"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, UnauthorizedError } from "@/lib/auth";
import { addPaymentSchema, type PaymentMethod } from "@/lib/validations";

export type { PaymentMethod };
export type ActionResult = { error: string | null };

export async function addPayment(
  orderId: string,
  method: PaymentMethod,
  amount: number
): Promise<ActionResult> {
  const parsed = addPaymentSchema.safeParse({ method, amount });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados de pagamento inválidos." };
  }

  let supabase;
  try {
    ({ supabase } = await requireRole(["ADMIN", "CASHIER"]));
  } catch (e) {
    return { error: e instanceof UnauthorizedError ? e.message : "Não autorizado." };
  }

  const { error } = await supabase.from("payments").insert({
    order_id: orderId,
    method: parsed.data.method,
    amount: parsed.data.amount,
  });

  if (error) {
    return { error: "Não foi possível registrar o pagamento." };
  }

  revalidatePath(`/pdv/pedido/${orderId}`);
  return { error: null };
}

/**
 * Fecha a comanda: recalcula o total e o valor pago DIRETO NO SERVIDOR
 * (nunca confia no saldo mostrado no client) e só encerra o pedido se o
 * valor pago cobrir o total devido. Libera a mesa (status -> FREE) em
 * seguida.
 */
export async function closeOrder(orderId: string): Promise<ActionResult> {
  let supabase;
  try {
    ({ supabase } = await requireRole(["ADMIN", "CASHIER"]));
  } catch (e) {
    return { error: e instanceof UnauthorizedError ? e.message : "Não autorizado." };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, table_id, service_fee, order_items(quantity, unit_price, status), payments(amount)")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return { error: "Pedido não encontrado." };
  }

  const subtotal = order.order_items
    .filter((item: { status: string }) => item.status !== "CANCELLED")
    .reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    );
  const total = subtotal * (1 + order.service_fee / 100);
  const paid = order.payments.reduce(
    (sum: number, p: { amount: number }) => sum + p.amount,
    0
  );

  // Tolerância de 1 centavo para evitar falhas por arredondamento de ponto
  // flutuante nos somatórios acima.
  if (paid + 0.01 < total) {
    return {
      error: "O valor pago ainda não cobre o total da conta.",
    };
  }

  const { error: closeError } = await supabase
    .from("orders")
    .update({ status: "CLOSED", closed_at: new Date().toISOString() })
    .eq("id", orderId);

  if (closeError) {
    return { error: "Não foi possível fechar a comanda." };
  }

  await supabase
    .from("tables")
    .update({ status: "FREE" })
    .eq("id", order.table_id);

  revalidatePath("/pdv");
  redirect("/pdv");
}
