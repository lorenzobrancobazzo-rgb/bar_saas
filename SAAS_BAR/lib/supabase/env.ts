/**
 * Lê e valida as variáveis de ambiente do Supabase de um jeito só, usado
 * pelo client, pelo server e pelo middleware.
 *
 * Por que isso existe: antes, os 3 lugares faziam
 * `process.env.NEXT_PUBLIC_SUPABASE_URL!` direto — o `!` diz pro
 * TypeScript "confia em mim, isso nunca é undefined", mas se a variável
 * realmente estiver ausente (ou tiver uma quebra de linha colada junto,
 * o que acontece com frequência ao copiar de um chat/markdown), o erro
 * vira um crash genérico dentro do middleware, sem nenhuma mensagem útil
 * — exatamente o MIDDLEWARE_INVOCATION_FAILED sem detalhe nenhum que
 * apareceu no Vercel. Agora, se faltar algo, o erro conta exatamente o
 * que está errado.
 */
function readEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  const raw = process.env[name];
  const value = raw?.trim();

  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} não está definida no Vercel (Project Settings → Environment Variables → Production), ou o deploy atual foi feito antes dela ser salva — nesse caso, faça um novo Redeploy.`
    );
  }

  return value;
}

export function getSupabaseUrl() {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  try {
    new URL(url);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL está definida mas não é uma URL válida: "${url}". Confira se não colou espaço ou quebra de linha extra ao salvar no Vercel.`
    );
  }
  return url;
}

export function getSupabaseAnonKey() {
  return readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}
