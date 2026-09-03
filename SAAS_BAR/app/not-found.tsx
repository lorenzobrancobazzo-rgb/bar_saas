import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-950 p-6 text-center text-slate-100">
      <p className="text-sm font-medium uppercase tracking-widest text-slate-500">404</p>
      <p className="text-sm text-slate-400">Página não encontrada.</p>
      <Link href="/" className="text-sm text-emerald-400 hover:underline">
        Voltar ao início
      </Link>
    </div>
  );
}
