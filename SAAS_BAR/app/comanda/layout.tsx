import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function ComandaLayout({
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
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  // Defesa em profundidade — o middleware.ts já bloqueia /comanda para
  // roles fora de ADMIN/WAITER, mas uma role inesperada aqui não deve
  // renderizar a UI do garçom.
  if (profile && !["ADMIN", "WAITER"].includes(profile.role)) {
    redirect("/nao-autorizado");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0F1210]">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#262B25] bg-[#171B18] px-4 py-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8B948C]">
            Comanda
          </p>
          <p className="text-sm font-medium text-[#F5F3EE]">
            {profile?.full_name ?? "Garçom"}
          </p>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-[#2C322C] px-3 py-1.5 text-xs font-medium text-[#8B948C] transition-colors hover:border-[#E8791A]/50 hover:text-[#F5F3EE]"
          >
            Sair
          </button>
        </form>
      </header>

      <main className="flex-1 px-3 pb-8 pt-4">{children}</main>
    </div>
  );
}
