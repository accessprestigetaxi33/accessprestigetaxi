// Suivi temps réel : dès qu'une ligne change en base (statut de course,
// nouveau message, position du chauffeur…), les écrans concernés sont
// rafraîchis immédiatement sans attendre le prochain sondage.
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/nova-supabase";

type Options = {
  /** Clés de requêtes à invalider quand une ligne change. */
  queryKeys: unknown[][];
  /** Tables écoutées (par défaut les réservations). */
  tables?: string[];
  /** Filtre optionnel : ne réagir qu'aux lignes correspondantes. */
  match?: (row: Record<string, unknown>) => boolean;
  enabled?: boolean;
  /** Suffixe de canal, pour éviter les collisions entre écrans. */
  channel?: string;
};

export function useReservationsRealtime({
  queryKeys,
  tables = ["reservations"],
  match,
  enabled = true,
  channel = "reservations",
}: Options) {
  const qc = useQueryClient();
  const keys = JSON.stringify(queryKeys);
  const tableList = JSON.stringify(tables);

  useEffect(() => {
    if (!enabled) return;
    const parsed = JSON.parse(keys) as unknown[][];
    const watched = JSON.parse(tableList) as string[];
    let ch = supabase.channel(`${channel}-rt-${Math.random().toString(36).slice(2, 8)}`);
    for (const table of watched) {
      ch = ch.on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
        const row = (payload.new ?? payload.old ?? {}) as Record<string, unknown>;
        if (match && !match(row)) return;
        for (const key of parsed) void qc.invalidateQueries({ queryKey: key });
      });
    }
    ch.subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qc, keys, tableList, enabled, channel]);
}
