"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendOrderItems, type CartItemInput } from "./actions";

type Product = {
  id: string;
  category_id: string;
  name: string;
  price: number;
};

type Category = {
  id: string;
  name: string;
};

type SentItem = {
  id: string;
  quantity: number;
  unit_price: number;
  notes: string | null;
  status: string;
  products: { name: string } | null;
};

type CartLine = { quantity: number; notes: string };

const SENT_STATUS_LABEL: Record<string, string> = {
  SENT: "Enviado",
  PREPARING: "Em preparo",
  READY: "Pronto",
  DELIVERED: "Entregue",
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function OrderBuilder({
  tableId,
  categories,
  products,
  sentItems,
}: {
  tableId: string;
  categories: Category[];
  products: Product[];
  sentItems: SentItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, CartLine>>({});

  const productById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  const cartEntries = Object.entries(cart).filter(([, line]) => line.quantity > 0);
  const cartCount = cartEntries.reduce((sum, [, line]) => sum + line.quantity, 0);
  const cartSubtotal = cartEntries.reduce((sum, [productId, line]) => {
    const product = productById.get(productId);
    return sum + (product ? product.price * line.quantity : 0);
  }, 0);

  function addToCart(productId: string) {
    setCart((prev) => ({
      ...prev,
      [productId]: {
        quantity: (prev[productId]?.quantity ?? 0) + 1,
        notes: prev[productId]?.notes ?? "",
      },
    }));
  }

  function decrementFromCart(productId: string) {
    setCart((prev) => {
      const current = prev[productId];
      if (!current) return prev;
      const nextQuantity = current.quantity - 1;
      const next = { ...prev };
      if (nextQuantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = { ...current, quantity: nextQuantity };
      }
      return next;
    });
  }

  function updateNotes(productId: string, notes: string) {
    setCart((prev) =>
      prev[productId] ? { ...prev, [productId]: { ...prev[productId], notes } } : prev
    );
  }

  function handleSend() {
    setError(null);

    const items: CartItemInput[] = cartEntries.map(([productId, line]) => ({
      productId,
      quantity: line.quantity,
      notes: line.notes,
    }));

    startTransition(async () => {
      const result = await sendOrderItems(tableId, items);
      if (result.error) {
        setError(result.error);
        return;
      }
      setCart({});
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6 pb-28">
      {/* Itens já enviados para a cozinha nesta comanda */}
      {sentItems.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#8B948C]">
            Já enviado
          </h2>
          <div className="flex flex-col gap-2 rounded-lg border border-[#262B25] bg-[#171B18] p-3">
            {sentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-[#232823] pb-2 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm text-[#F5F3EE]">
                    {item.quantity}x {item.products?.name ?? "Item removido"}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-[#8B948C]">{item.notes}</p>
                  )}
                </div>
                <span className="rounded-full bg-[#0F1210] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-[#8B948C]">
                  {SENT_STATUS_LABEL[item.status] ?? item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cardápio agrupado por categoria */}
      {categories.map((category) => {
        const categoryProducts = products.filter(
          (p) => p.category_id === category.id
        );
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className="flex flex-col gap-2.5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#8B948C]">
              {category.name}
            </h2>
            <div className="flex flex-col gap-2">
              {categoryProducts.map((product) => {
                const line = cart[product.id];
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-[#262B25] bg-[#171B18] p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-[#F5F3EE]">
                        {product.name}
                      </p>
                      <p className="text-xs text-[#8B948C]">
                        {currency.format(product.price)}
                      </p>
                    </div>

                    {line ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decrementFromCart(product.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2C322C] text-[#F5F3EE]"
                          aria-label={`Remover uma unidade de ${product.name}`}
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-sm text-[#F5F3EE]">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(product.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2C322C] text-[#F5F3EE]"
                          aria-label={`Adicionar uma unidade de ${product.name}`}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(product.id)}
                        className="rounded-md bg-[#E8791A] px-3 py-1.5 text-xs font-semibold text-[#171205]"
                      >
                        Adicionar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Observações rápidas para itens no carrinho (ex: "sem cebola") */}
      {cartEntries.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#8B948C]">
            Observações
          </h2>
          <div className="flex flex-col gap-2">
            {cartEntries.map(([productId, line]) => {
              const product = productById.get(productId);
              if (!product) return null;
              return (
                <div key={productId} className="flex flex-col gap-1">
                  <label
                    htmlFor={`notes-${productId}`}
                    className="text-xs text-[#8B948C]"
                  >
                    {line.quantity}x {product.name}
                  </label>
                  <input
                    id={`notes-${productId}`}
                    type="text"
                    value={line.notes}
                    onChange={(e) => updateNotes(productId, e.target.value)}
                    placeholder="ex: sem cebola, ponto da carne..."
                    className="rounded-md border border-[#2C322C] bg-[#0F1210] px-3 py-2 text-sm text-[#F5F3EE] placeholder:text-[#5B635C] focus:border-[#E8791A] focus:outline-none focus:ring-1 focus:ring-[#E8791A]"
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Barra fixa de resumo/envio */}
      <div className="fixed inset-x-0 bottom-0 border-t border-[#262B25] bg-[#171B18] px-4 py-3">
        {error && (
          <p role="alert" className="mb-2 text-xs text-[#F2A38F]">
            {error}
          </p>
        )}
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[#8B948C]">
              {cartCount} {cartCount === 1 ? "item" : "itens"}
            </p>
            <p className="font-mono text-sm font-semibold text-[#F5F3EE]">
              {currency.format(cartSubtotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={cartCount === 0 || isPending}
            className="flex-1 rounded-md bg-[#E8791A] px-4 py-2.5 text-sm font-semibold text-[#171205] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Enviando..." : "Enviar para a cozinha"}
          </button>
        </div>
      </div>
    </div>
  );
}