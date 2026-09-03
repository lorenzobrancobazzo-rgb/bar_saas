import Link from "next/link";

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F1210] text-[#F5F3EE]">
      <header className="flex items-center justify-between border-b border-[#262B25] px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/superadmin" className="text-sm font-semibold tracking-wide">
            Painel da Plataforma
          </Link>
          <nav className="flex gap-4 text-sm text-[#8B948C]">
            <Link href="/superadmin" className="hover:text-[#F5F3EE]">Restaurantes</Link>
          </nav>
        </div>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-[#8B948C] hover:text-[#F5F3EE]" type="submit">
            Sair
          </button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
