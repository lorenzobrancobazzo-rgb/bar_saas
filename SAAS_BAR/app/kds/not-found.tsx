import Link from "next/link";

export default function KdsNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-lg border border-[#262B25] bg-[#171B18] p-8 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-[#5B635C]">404</p>
      <p className="text-sm text-[#8B948C]">Página não encontrada.</p>
      <Link href="/kds" className="text-sm text-[#E8791A] hover:underline">
        Voltar à fila de produção
      </Link>
    </div>
  );
}
