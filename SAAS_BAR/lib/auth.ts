import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type Role = Database["public"]["Enums"]["user_role"];

export class UnauthorizedError extends Error {}

/**
 * Verifica, DENTRO da própria Server Action, que o usuário logado tem um
 * dos roles permitidos.
 *
 * Por quê isso existe apesar do middleware.ts já bloquear por rota: uma
 * Server Action é invocada via POST identificado por um hash de ação, não
 * necessariamente amarrado ao caminho da página que a renderizou — então
 * proteção só por URL é insuficiente. E a RLS no banco isola por tenant,
 * não por cargo (um WAITER e um ADMIN do mesmo restaurante passam pela
 * mesma policy). Este helper é a camada que faltava.
 */
export async function requireRole(allowed: Role[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError("Sessão expirada. Faça login novamente.");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    throw new UnauthorizedError("Não foi possível identificar seu usuário.");
  }

  if (!allowed.includes(profile.role)) {
    throw new UnauthorizedError("Você não tem permissão para executar esta ação.");
  }

  return { supabase, userId: user.id, tenantId: profile.tenant_id, role: profile.role };
}

/**
 * Equivalente ao requireRole, mas pra camada de platform_admins — que não
 * tem tenant nem role operacional, então não reaproveita requireRole().
 */
export async function requirePlatformAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError("Sessão expirada. Faça login novamente.");
  }

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) {
    throw new UnauthorizedError("Você não tem permissão para executar esta ação.");
  }

  return { supabase, userId: user.id };
}
