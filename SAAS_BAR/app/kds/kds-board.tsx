"use client";

import { useEffect, useState, useTransition } from "react";
import { updateOrderItemStatus } from "./actions";

export type KdsItem = {
  id: string;
  quantity: number;
  notes: string | null;
  status: "SENT" | "PREPARING" | "READY";
  sentAt: string | null;
  productName: string;
  tableNumber: number | null;
  tableSector: string | null;
};

const COLUMNS: { status: KdsItem["status"]; title: string }[] = [
  { status: "SENT", title: "Novo" },
  { status: "PREPARING", title: "Em preparo" },
  { status: "READY", title: "Pronto" },
];

// Limiares de SLA em minutos — ajuste conforme o tempo médio de preparo
// real da cozinha (o PRD não define um valor fixo).
function slaColor(elapsedSeconds: number) {
  const minutes = elapsedSeconds / 60;
  if (minutes < 5) return "border-[#2A3D2C] bg-[#141A15]";
  if (minutes < 10) return "border-[#3D2E1B] bg-[#1A1512]";
  return "border-[#3D2624] bg-[#1A1413]";
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function KdsCard({ item }: { item: KdsItem }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsedSeconds = item.sentAt
    ? Math.max(0, (now - new Date(item.sentAt).getTime()) / 1000)
    : 0;

  function handleAdvance(nextStatus: "PREPARING" | "READY") {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderItemStatus(item.id, nextStatus);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border p-3 ${slaColor(elapsedSeconds)}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold text-[#F5F3EE]">
          Mesa {item.tableNumber?.toString().padStart(2, "0") ?? "--"}
        </span>
        <span className="font-mono text-xs text-[#8B948C]">
          {formatElapsed(elapsedSeconds)}
        </span>
      </div>

      <p className="text-sm text-[#F5F3EE]">
        {item.quantity}x {item.productName}
      </p>

      {item.notes && (
        <p className="rounded bg-[#0F1210] px-2 py-1 text-xs text-[#E8B58A]">
          {item.notes}
        </p>
      )}

      {item.tableSector && (
        <p className="text-[11px] text-[#5B635C]">{item.tableSector}</p>
      )}

      {error && <p className="text-xs text-[#F2A38F]">{error}</p>}

      {item.status === "SENT" && (
        <button
          type="button"
          onClick={() => handleAdvance("PREPARING")}
          disabled={isPending}
          className="mt-1 rounded-md bg-[#E8791A] px-3 py-1.5 text-xs font-semibold text-[#171205] disabled:opacity-50"
        >
          {isPending ? "..." : "Iniciar preparo"}
        </button>
      )}

      {item.status === "PREPARING" && (
        <button
          type="button"
          onClick={() => handleAdvance("READY")}
          disabled={isPending}
          className="mt-1 rounded-md bg-[#3FA34D] px-3 py-1.5 text-xs font-semibold text-[#0F1210] disabled:opacity-50"
        >
          {isPending ? "..." : "Marcar como pronto"}
        </button>
      )}

      {item.status === "READY" && (
        <p className="mt-1 text-center text-xs font-medium uppercase tracking-wide text-[#3FA34D]">
          Aguardando retirada
        </p>
      )}
    </div>
  );
}

export function KdsBoard({ items }: { items: KdsItem[] }) {
  return (
    <div className="flex h-full gap-4">
      {COLUMNS.map((column) => {
        const columnItems = items.filter((item) => item.status === column.status);
        return (
          <div key={column.status} className="flex w-72 shrink-0 flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#8B948C]">
                {column.title}
              </h2>
              <span className="rounded-full bg-[#171B18] px-2 py-0.5 text-[11px] text-[#8B948C]">
                {columnItems.length}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {columnItems.length === 0 && (
                <p className="rounded-lg border border-dashed border-[#262B25] p-4 text-center text-xs text-[#5B635C]">
                  Nenhum item
                </p>
              )}
              {columnItems.map((item) => (
                <KdsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}