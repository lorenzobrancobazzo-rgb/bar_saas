"use server";

import { revalidatePath } from "next/cache";
import { requireRole, UnauthorizedError } from "@/lib/auth";
import { sendOrderItemsSchema } from "@/lib/validations";

export type CartItemInput = {
  productId: string;
  quantity: number;
  notes: string;
};

export type SendOrderResult = { error: string | null };

/**
 * Reaproveita o pedido OPEN da mesa (ou abre um novo) e envia os itens do
 * carrinho como order_items com status 'SENT'.
 */
export async function sendOrderItems(
  tableId: string,
  items: CartItemInput[]
): Promise<SendOrderResult> {
  const parsed = sendOrderItemsSchema.safeParse(items);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Itens inválidos." };
  }
  items = parsed.data;

  let supabase, userId, tenantId;
  try {
    ({ supabase, userId, tenantId } = await requireRole(["ADMIN", "WAITER"]));
  } catch (e) {
    return { error: e instanceof UnauthorizedError ? e.message : "Não autorizado." };
  }

  // 1. Reaproveita o pedido OPEN da mesa ou abre um novo.
  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("table_id", tableId)
    .eq("status", "OPEN")
    .maybeSingle();

  let orderId = existingOrder?.id as string | undefined;

  if (!orderId) {
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        tenant_id: tenantId,
        table_id: tableId,
        waiter_id: userId,
        status: "OPEN",
      })
      .select("id")
      .single();

    if (orderError || !newOrder) {
      return { error: "Não foi possível abrir o pedido para esta mesa." };
    }

    orderId = newOrder.id;

    // Mesa livre passa a ocupada assim que o primeiro pedido é aberto.
    await supabase
      .from("tables")
      .update({ status: "OCCUPIED" })
      .eq("id", tableId)
      .eq("status", "FREE");
  }

  // 2. Busca o preço vigente direto do banco — nunca confia no preço que
  //    veio do carrinho no client.
  const productIds = items.map((item) => item.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, price")
    .in("id", productIds);

  if (productsError || !products || products.length !== productIds.length) {
    return { error: "Um ou mais itens do carrinho não são mais válidos." };
  }

  const priceByProduct = new Map(products.map((p) => [p.id, p.price]));

  const rows = items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: priceByProduct.get(item.productId)!,
    notes: item.notes.trim() || null,
    status: "SENT" as const,
  }));

  const { error: insertError } = await supabase
    .from("order_items")
    .insert(rows);

  if (insertError) {
    return {
      error: "Falha ao enviar o pedido para a cozinha. Tente novamente.",
    };
  }

  revalidatePath(`/comanda/mesa/${tableId}`);
  return { error: null };
}