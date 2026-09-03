"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/env";

/**
 * Cliente Supabase para uso em Client Components ("use client").
 * Deve ser instanciado dentro do componente/hook que o utiliza —
 * nunca em escopo de módulo compartilhado entre requisições.
 *
 * Exemplo:
 *   const supabase = createClient();
 *   const { data } = await supabase.from("tables").select("*");
 */
export function createClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}