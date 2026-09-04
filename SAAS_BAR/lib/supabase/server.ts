import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/env";

/**
 * Cliente Supabase para uso em Server Components, Server Actions e Route
 * Handlers. Deve ser criado (com `await`) a cada requisição — nunca
 * reutilizado como singleton, pois carrega os cookies da requisição atual.
 *
 * Exemplo (Server Component):
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *
 * Exemplo (Server Action):
 *   "use server";
 *   const supabase = await createClient();
 *   await supabase.from("orders").insert({ ... });
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as CookieOptions);
            });
          } catch {
            // `setAll` foi chamado a partir de um Server Component.
            // Isso pode ser ignorado com segurança se o middleware já
            // estiver renovando a sessão em toda requisição (ver middleware.ts).
          }
        },
      },
    }
  );
}
