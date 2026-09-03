"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      className="rounded-md border border-[#2C322C] px-3 py-1.5 text-xs font-medium text-[#8B948C] transition-colors hover:border-[#E8791A]/50 hover:text-[#F5F3EE] disabled:opacity-50"
    >
      {isPending ? "Atualizando..." : "Atualizar"}
    </button>
  );
}