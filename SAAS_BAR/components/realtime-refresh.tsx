"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Escuta mudanças (INSERT/UPDATE/DELETE) nas tabelas informadas via
 * Supabase Realtime e chama router.refresh() para re-buscar os dados no
 * servidor — mantém o Server Component como única fonte de verdade em vez
 * de duplicar estado no client.
 *
 * Pré-requisito no banco (rodar uma vez por projeto Supabase):
 *   ALTER PUBLICATION supabase_realtime ADD TABLE order_items, orders, tables, payments;
 * Sem isso, a subscription conecta mas nunca recebe eventos.
 *
 * A RLS de cada tabela já filtra os eventos por tenant automaticamente,
 * então nenhum filtro adicional é necessário aqui.
 */
export function RealtimeRefresh({
  tables,
  channelName,
}: {
  tables: string[];
  channelName: string;
}) {
  const router = useRouter();
  const tablesKey = tables.join(",");

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(channelName);

    tablesKey.split(",").forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => router.refresh()
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // tablesKey representa `tables` de forma estável entre renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, tablesKey]);

  return null;
}
