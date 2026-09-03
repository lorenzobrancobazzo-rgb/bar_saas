import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Rota chamada pelos formulários <form action="/auth/signout" method="post">
 * espalhados pelos layouts (admin, comanda, kds, pdv, superadmin). Faltava
 * inteiramente no projeto — os botões "Sair" davam 404 antes desta rota.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url));
}
