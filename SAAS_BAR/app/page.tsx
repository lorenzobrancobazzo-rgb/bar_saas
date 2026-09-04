import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

// Mesmo destino por role usado no RBAC do middleware.ts — mantenha os dois
// sincronizados caso os nomes de rota mudem.
const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: "/admin",
  CASHIER: "/pdv",
  KITCHEN: "/kds",
  WAITER: "/comanda",
};

/**
 * A rota "/" nunca renderiza UI própria — ela apenas resolve para onde o
 * usuário deve ir com base na sessão e na role. O middleware.ts já bloqueia
 * acesso não autenticado a rotas protegidas, mas fazemos a checagem aqui
 * também (defesa em profundidade) já que Server Components podem ser
 * alcançados por outros caminhos de navegação.
 */
export default async function RootPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: platformAdmin } = await supabase
    .from("platform_admins")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (platformAdmin) {
    redirect("/superadmin");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile?.role) {
    // Usuário autenticado no Supabase Auth mas sem registro em public.users
    // (ex: convite pendente de vínculo a um tenant) — não há para onde
    // roteá-lo com segurança.
    redirect("/nao-autorizado");
  }

  const role = profile.role as UserRole;
  redirect(ROLE_HOME[role]);
}
