import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PdvLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // Defesa em profundidade — o middleware.ts já bloqueia /pdv para roles
  // fora de ADMIN/CASHIER.
  if (profile && !["ADMIN", "CASHIER"].includes(profile.role)) {
    redirect("/nao-autorizado");
  }

  return (
    <div className="min-h-screen bg-[#0F1210]">
      <header className="border-b border-[#262B25] bg-[#171B18] px-6 py-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8B948C]">
          PDV
        </p>
        <p className="text-sm font-medium text-[#F5F3EE]">Contas em aberto</p>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}