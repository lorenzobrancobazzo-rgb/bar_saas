import Link from "next/link";

type TableStatus = "FREE" | "OCCUPIED" | "AWAITING_BILL" | "IDLE";

const STATUS_CONFIG: Record<
  TableStatus,
  { label: string; dot: string; border: string; bg: string }
> = {
  FREE: {
    label: "Livre",
    dot: "bg-[#3FA34D]",
    border: "border-[#2A3D2C]",
    bg: "bg-[#141A15]",
  },
  OCCUPIED: {
    label: "Ocupada",
    dot: "bg-[#D64545]",
    border: "border-[#3D2624]",
    bg: "bg-[#1A1413]",
  },
  AWAITING_BILL: {
    label: "Aguardando conta",
    dot: "bg-[#E8791A]",
    border: "border-[#3D2E1B]",
    bg: "bg-[#1A1512]",
  },
  IDLE: {
    label: "Ociosa",
    dot: "bg-[#8B948C]",
    border: "border-[#2C322C]",
    bg: "bg-[#171B18]",
  },
};

export function TableCard({
  id,
  number,
  capacity,
  status,
}: {
  id: string;
  number: number;
  capacity: number;
  status: string;
}) {
  const config = STATUS_CONFIG[status as TableStatus] ?? STATUS_CONFIG.IDLE;

  return (
    <Link
      href={`/comanda/mesa/${id}`}
      className={`flex min-h-[92px] flex-col justify-between rounded-xl border ${config.border} ${config.bg} p-3 active:scale-[0.97] transition-transform`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-lg font-semibold text-[#F5F3EE]">
          {number.toString().padStart(2, "0")}
        </span>
        <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
      </div>

      <div>
        <p className="text-xs text-[#8B948C]">{config.label}</p>
        <p className="text-[11px] text-[#5B635C]">{capacity} lugares</p>
      </div>
    </Link>
  );
}
