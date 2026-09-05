import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { LandingPage } from "@/components/landing-page";

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
 * "/" é a landing page pública para quem não está logado — e só faz
 * roteamento por role para quem já tem sessão. O middleware.ts já trata
 * "/" como rota pública; fazemos a checagem aqui também (defesa em
 * profundidade) já que Server Components podem ser alcançados por outros
 * caminhos de navegação.
 */
export default async function RootPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
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
