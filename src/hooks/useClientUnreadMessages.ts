import { useEffect, useState } from "react";
import { countUnreadMergedForClient } from "@/lib/chat.functions";
import { getClientSession } from "@/lib/client-session";

/**
 * Compteur global de messages chauffeur non lus pour le client connecté.
 * Rafraîchi toutes les 25 s et au retour au premier plan ; renvoie 0 tant
 * qu'aucune session client n'est disponible (pages publiques incluses).
 */
export function useClientUnreadMessages(pollMs = 25000) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      if (stop || (typeof document !== "undefined" && document.hidden)) return;
      const session = getClientSession();
      if (!session?.token) {
        setUnread(0);
        return;
      }
      try {
        const res = await countUnreadMergedForClient({
          data: { role: "client", token: session.token },
        });
        if (!stop) setUnread(res.unread ?? 0);
      } catch {
        /* réseau indisponible : on garde la dernière valeur connue */
      }
    };
    void tick();
    const id = setInterval(tick, pollMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stop = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pollMs]);

  return unread;
}
