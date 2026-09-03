"use server";

import { revalidatePath } from "next/cache";
import { requireRole, UnauthorizedError } from "@/lib/auth";

export type UpdateStatusResult = { error: string | null };

/**
 * Avança o status de um order_item dentro do fluxo do KDS
 * (SENT -> PREPARING -> READY).
 */
export async function updateOrderItemStatus(
  itemId: string,
  status: "PREPARING" | "READY"
): Promise<UpdateStatusResult> {
  let supabase;
  try {
    ({ supabase } = await requireRole(["ADMIN", "KITCHEN"]));
  } catch (e) {
    return { error: e instanceof UnauthorizedError ? e.message : "Não autorizado." };
  }

  const { error } = await supabase
    .from("order_items")
    .update({ status })
    .eq("id", itemId);

  if (error) {
    return { error: "Não foi possível atualizar o status do item." };
  }

  revalidatePath("/kds");
  return { error: null };
}
