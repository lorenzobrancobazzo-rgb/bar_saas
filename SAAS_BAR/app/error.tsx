"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aqui é o ponto de integração com Sentry (Sentry.captureException(error))
    // quando a conta/DSN estiver configurada.
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-center text-slate-100">
      <p className="text-sm font-medium uppercase tracking-widest text-rose-400">
        Ops, algo deu errado
      </p>
      <p className="max-w-sm text-sm text-slate-400">
        {error.message || "Não foi possível carregar esta página. Verifique sua conexão e tente novamente."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}
