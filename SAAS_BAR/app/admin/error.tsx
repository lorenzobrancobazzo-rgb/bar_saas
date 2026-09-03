"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/admin/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-xl border border-[#262B25] bg-[#171B18] p-8 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-[#F2A38F]">
        Falha no painel administrativo
      </p>
      <p className="max-w-sm text-sm text-[#8B948C]">
        {error.message || "Não foi possível concluir a operação. Tente novamente."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-[#E8791A] px-4 py-2 text-sm font-medium text-[#171205] transition hover:opacity-90"
      >
        Tentar novamente
      </button>
    </div>
  );
}
