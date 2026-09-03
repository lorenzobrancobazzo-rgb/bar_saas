import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RefreshButton } from "./refresh-button";

export default async function KdsLayout({
  children,
}: {
  children: ReactNode;
}) {
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

  // Defesa em profundidade — o middleware.ts já bloqueia /kds para roles
  // fora de ADMIN/KITCHEN.
  if (profile && !["ADMIN", "KITCHEN"].includes(profile.role)) {
    redirect("/nao-autorizado");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0F1210]">
      <header className="flex items-center justify-between border-b border-[#262B25] bg-[#171B18] px-5 py-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8B948C]">
            Kitchen Display System
          </p>
          <p className="text-sm font-medium text-[#F5F3EE]">Fila de produção</p>
        </div>
        <RefreshButton />
      </header>

      <main className="flex-1 overflow-x-auto p-5">{children}</main>
    </div>
  );
}