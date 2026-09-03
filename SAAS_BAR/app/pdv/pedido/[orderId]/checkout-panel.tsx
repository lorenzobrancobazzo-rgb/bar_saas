"use client";

import { useState, useTransition } from "react";
import { addPayment, closeOrder, type PaymentMethod } from "./actions";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Dinheiro",
  DEBIT_CARD: "Cartão de débito",
  CREDIT_CARD: "Cartão de crédito",
  PIX: "Pix",
  OTHER: "Outro",
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function CheckoutPanel({
  orderId,
  remaining,
}: {
  orderId: string;
  remaining: number;
}) {
  const [method, setMethod] = useState<PaymentMethod>("PIX");
  const [amount, setAmount] = useState(remaining > 0 ? remaining.toFixed(2) : "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAddPayment() {
    setError(null);
    const parsed = Number(amount.replace(",", "."));

    startTransition(async () => {
      const result = await addPayment(orderId, method, parsed);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  function handleClose() {
    setError(null);
    startTransition(async () => {
      const result = await closeOrder(orderId);
      // Em caso de sucesso, closeOrder() já faz o redirect — só chegamos
      // aqui de volta se houve erro.
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#262B25] bg-[#171B18] p-4">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#8B948C]">
        Receber pagamento
      </h2>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          className="rounded-md border border-[#2C322C] bg-[#0F1210] px-3 py-2 text-sm text-[#F5F3EE] focus:border-[#E8791A] focus:outline-none focus:ring-1 focus:ring-[#E8791A]"
        >
          {Object.entries(METHOD_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
          className="flex-1 rounded-md border border-[#2C322C] bg-[#0F1210] px-3 py-2 text-sm text-[#F5F3EE] placeholder:text-[#5B635C] focus:border-[#E8791A] focus:outline-none focus:ring-1 focus:ring-[#E8791A]"
        />

        <button
          type="button"
          onClick={handleAddPayment}
          disabled={isPending || !amount}
          className="rounded-md border border-[#2C322C] px-4 py-2 text-sm font-medium text-[#F5F3EE] hover:border-[#E8791A]/50 disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-[#F2A38F]">
          {error}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-[#232823] pt-3">
        <div>
          <p className="text-[11px] text-[#8B948C]">Saldo restante</p>
          <p className="font-mono text-base font-semibold text-[#F5F3EE]">
            {currency.format(remaining)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          disabled={isPending || remaining > 0.009}
          className="rounded-md bg-[#3FA34D] px-4 py-2.5 text-sm font-semibold text-[#0F1210] disabled:cursor-not-allowed disabled:bg-[#2C322C] disabled:text-[#5B635C]"
        >
          {isPending ? "Processando..." : "Fechar comanda"}
        </button>
      </div>
    </div>
  );
}