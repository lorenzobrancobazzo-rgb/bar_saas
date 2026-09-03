"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations";

export type LoginState = {
  error: string | null;
};

export const initialLoginState: LoginState = { error: null };

/**
 * Server Action chamada pelo formulário de login (via useActionState).
 * Em caso de sucesso, redireciona para a home — o middleware.ts cuida do
 * roteamento por role a partir daí.
 */
export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Mensagem genérica de propósito — nunca revelar se o e-mail existe
    // ou não na base (evita enumeração de contas).
    return { error: "E-mail ou senha incorretos." };
  }

  redirect("/");
}