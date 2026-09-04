import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/env";

const PUBLIC_ROUTES = ["/login", "/auth/callback", "/nao-autorizado"];

const ROUTE_ACCESS: { prefix: string; roles: Database["public"]["Enums"]["user_role"][] }[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/pdv", roles: ["ADMIN", "CASHIER"] },
  { prefix: "/kds", roles: ["ADMIN", "KITCHEN"] },
  { prefix: "/comanda", roles: ["ADMIN", "WAITER"] },
];

const ROLE_HOME: Record<Database["public"]["Enums"]["user_role"], string> = {
  ADMIN: "/admin",
  CASHIER: "/pdv",
  KITCHEN: "/kds",
  WAITER: "/comanda",
};

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function getRequiredRoles(pathname: string) {
  return ROUTE_ACCESS.find((entry) => pathname.startsWith(entry.prefix))?.roles;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Qualquer redirect precisa levar consigo os cookies de sessão que
  // foram atualizados acima (renovação de token) — criar um
  // NextResponse.redirect "do zero" descarta esses cookies, o navegador
  // nunca recebe a sessão renovada, e a próxima requisição volta a achar
  // que não há sessão válida. Isso causava um loop de redirecionamento
  // infinito (ERR_TOO_MANY_REDIRECTS).
  function redirectTo(path: string) {
    const target = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
    return target;
  }

  // 1. Sem sessão tentando acessar rota protegida -> redireciona para /login
  if (!user && !isPublicRoute(pathname)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return redirectTo(`${redirectUrl.pathname}${redirectUrl.search}`);
  }

  // 2. Sem sessão e acessando rota pública (como /login) -> libera o acesso sem redirecionar
  if (!user) {
    return response;
  }

  // Busca permissão do usuário logado — em paralelo, checa se é
  // platform_admin (camada separada de `users`, não tem tenant nem role
  // operacional).
  const [{ data: profile }, { data: platformAdmin }] = await Promise.all([
    supabase.from("users").select("role").eq("id", user.id).maybeSingle(),
    supabase.from("platform_admins").select("id").eq("id", user.id).maybeSingle(),
  ]);

  const role = (profile as { role?: Database["public"]["Enums"]["user_role"] } | null)?.role;
  const isPlatformAdmin = Boolean(platformAdmin);

  // 3. Com sessão acessando /login ou '/' -> vai para a tela principal
  if (pathname === "/" || pathname.startsWith("/login")) {
    if (isPlatformAdmin) {
      return redirectTo("/superadmin");
    }
    const defaultRoute = role ? ROLE_HOME[role] : "/nao-autorizado";
    return redirectTo(defaultRoute);
  }

  // 4. /superadmin é exclusivo de platform_admins — nem ADMIN de tenant
  // entra aqui.
  if (pathname.startsWith("/superadmin")) {
    if (!isPlatformAdmin) {
      return redirectTo("/nao-autorizado");
    }
    return response;
  }

  // 5. Validação de acesso por rota (RBAC) das áreas operacionais
  const requiredRoles = getRequiredRoles(pathname);
  if (requiredRoles) {
    if (!role || !requiredRoles.includes(role)) {
      return redirectTo("/nao-autorizado");
    }
  }

  return response;
}
