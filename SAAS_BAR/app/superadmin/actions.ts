"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/auth";
import { tenantNameSchema, tenantStatusSchema } from "@/lib/validations";

// Mesmo padrão de app/admin/actions.ts: lança erro em vez de retornar
// {error} — assim dá pra usar a action direto em <form action={...}>, e o
// error.tsx do módulo captura a falha.

export async function createTenant(formData: FormData) {
  const parsed = tenantNameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Nome inválido.");

  const { supabase } = await requirePlatformAdmin();
  const { error } = await supabase.from("tenants").insert({ name: parsed.data.name });
  if (error) throw new Error("Não foi possível criar o restaurante.");

  revalidatePath("/superadmin");
}

export async function updateTenantStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const parsed = tenantStatusSchema.safeParse(formData.get("status"));
  if (!id) throw new Error("Restaurante inválido.");
  if (!parsed.success) throw new Error("Status inválido.");

  const { supabase } = await requirePlatformAdmin();
  const { error } = await supabase
    .from("tenants")
    .update({ status: parsed.data })
    .eq("id", id);

  if (error) throw new Error("Não foi possível atualizar o status.");

  revalidatePath("/superadmin");
}
