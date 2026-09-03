import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Calendar, MapPin, ArrowRight, Eye, Plus, RefreshCw, Share2, Car, ChevronRight } from "lucide-react";
import { shareRideTracking } from "@/lib/share-ride";
import { BrandLoader } from "@/components/BrandLoader";
import { toast } from "sonner";
import { ClientBottomNav } from "@/components/ClientBottomNav";
import { getClientSession } from "@/lib/client-session";
import type { ClientSession } from "@/lib/client-auth.functions";
import { listClientReservations, type ClientReservation } from "@/lib/client-reservations.functions";
import { useT } from "@/i18n/I18nProvider";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/client/trajets")({
  head: () => ({
    meta: [{ title: "Mes trajets — Access Prestige Taxi" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ClientTrajets,
});

const ACTIVE = new Set(["nouvelle", "pending", "accepted", "en_route", "arrived"]);

const STATUS_KEY: Record<string, { key: string; bg: string; fg: string }> = {
  nouvelle: { key: "cd_status_pending", bg: "rgba(234,179,8,0.15)", fg: "#facc15" },
  pending: { key: "cd_status_pending", bg: "rgba(234,179,8,0.15)", fg: "#facc15" },
  accepted: { key: "cd_status_accepted", bg: "rgba(34,197,94,0.15)", fg: "#4ade80" },
  en_route: { key: "cd_status_en_route", bg: "rgba(59,130,246,0.18)", fg: "#60a5fa" },
  arrived: { key: "cd_status_arrived", bg: "rgba(99,102,241,0.18)", fg: "#a5b4fc" },
  completed: { key: "cd_status_completed", bg: "rgba(214,168,61,0.18)", fg: "#e7bd5d" },
  cancelled: { key: "cd_status_cancelled", bg: "rgba(239,68,68,0.15)", fg: "#f87171" },
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    });
  } catch {
    return iso;
  }
}

const css = `
.ct-root{min-height:100dvh;background:#030a13;color:#f5f1e8;font-family:Inter,system-ui,sans-serif;padding:0 0 82px}
.ct-main{padding:12px}
.ct-main-inner{max-width:390px;margin:0 auto}
.ct-shell{border-radius:24px;padding:13px;background:#030a13;box-shadow:0 0 40px rgba(214,168,61,.06)}
.ct-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.ct-kicker{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#e6b95a}
.ct-title{font-family:Georgia,serif;font-size:20px;margin:4px 0 0}
.ct-refresh{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(214,168,61,.45);border-radius:8px;padding:7px 10px;font-size:10px;color:#e7bd5d;background:transparent}
.ct-loading{display:flex;align-items:center;justify-content:center;gap:8px;border-radius:14px;background:#07101a;padding:34px 12px;color:rgba(255,255,255,.6);font-size:12px;margin-top:14px}
.ct-empty{margin-top:14px;padding:24px 16px;border:1px dashed rgba(214,168,61,.45);border-radius:14px;text-align:center;color:rgba(255,255,255,.55);font-size:11px}
.ct-empty a{margin-top:14px;display:inline-flex;align-items:center;gap:6px;border-radius:8px;padding:9px 16px;font-size:10px;font-weight:800;color:#171006;background:linear-gradient(135deg,#f6cd6b,#cf962a);text-decoration:none}
.ct-list{margin-top:14px;display:flex;flex-direction:column;gap:8px}
.ct-ride{position:relative;border:1px solid rgba(214,168,61,.45);border-radius:12px;padding:12px;background:linear-gradient(145deg,#111b26,#07101a)}
.ct-ride-top{display:flex;align-items:center;gap:8px}
.ct-ride-icon{display:grid;place-items:center;width:30px;height:30px;flex-shrink:0;border-radius:999px;border:1px solid rgba(214,168,61,.5);color:#e7bd5d}
.ct-ride-when{flex:1;font-size:10px;color:rgba(255,255,255,.65);display:flex;align-items:center;gap:5px}
.ct-status{font-size:9px;font-weight:700;border-radius:999px;padding:4px 8px;flex-shrink:0}
.ct-route{margin-top:8px;padding-left:38px;font-size:12px;line-height:1.6;color:#fff;display:flex;align-items:flex-start;gap:6px}
.ct-price{margin-top:6px;padding-left:38px;font-size:11px;color:rgba(255,255,255,.6)}
.ct-price b{color:#e7bd5d;font-weight:700}
.ct-actions{margin-top:10px;padding-left:38px;display:flex;flex-wrap:wrap;gap:8px}
.ct-actions a,.ct-actions button{display:inline-flex;align-items:center;gap:5px;border-radius:7px;padding:7px 10px;font-size:9px;font-weight:800;text-decoration:none;border:1px solid rgba(214,168,61,.5)}
.ct-actions a.primary{background:linear-gradient(135deg,#f6cd6b,#cf962a);color:#171006;border-color:transparent}
.ct-actions button,.ct-actions a.secondary{color:#f5f1e8;background:transparent;border-color:rgba(255,255,255,.2)}
@media(min-width:700px){.ct-main-inner{max-width:720px}.ct-shell{padding:20px}}
`;

function ClientTrajets() {
  const navigate = useNavigate();
  const t = useT();
  const [session, setSession] = useState<ClientSession | null>(null);
  const [rows, setRows] = useState<ClientReservation[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getClientSession();
    if (!s) {
      navigate({ to: "/client/login" });
      return;
    }
    setSession(s);
  }, [navigate]);

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const data = await listClientReservations({
        data: { token: session.token },
      });
      setRows(data.filter((r) => ACTIVE.has(r.status)));
    } catch {
      toast.error(t("client.trajets.load_err"));
    } finally {
      setLoading(false);
    }
  }, [session, t]);

  useEffect(() => {
    if (session) refresh();
  }, [session, refresh]);

  // Rafraîchissement live — SANS postgres_changes.
  // La table `reservations` n'expose aucune policy SELECT aux rôles anon /
  // authenticated (lecture volontairement fermée : les données client passent
  // uniquement par des fonctions serveur authentifiées). Un abonnement
  // postgres_changes ne recevrait donc jamais aucune ligne. On écoute à la
  // place le broadcast `suivi:<id>` émis par le chauffeur à chaque changement.
  useEffect(() => {
    if (!session || !rows || rows.length === 0) return;
    const ids = rows.map((r) => r.id);
    const channels = ids.map((id) => {
      const ch = (supabase as any).channel(`suivi:${id}`, {
        config: { broadcast: { self: false } },
      });
      ch.on("broadcast", { event: "update" }, () => refresh()).subscribe();
      return ch;
    });
    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [session, rows, refresh]);

  if (!session) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="ct-root">
        <main className="ct-main">
          <div className="ct-main-inner">
            <div className="ct-shell">
              <div className="ct-top">
                <div>
                  <div className="ct-kicker">{t("client.eyebrow")}</div>
                  <h1 className="ct-title">{t("client.trajets.title")}</h1>
                </div>
                <button className="ct-refresh" onClick={refresh}>
                  <RefreshCw size={13} /> {t("client.trajets.refresh")}
                </button>
              </div>

              {loading && (
                <div className="ct-loading">
                  <BrandLoader size={18} /> {t("client.trajets.loading")}
                </div>
              )}

              {!loading && rows && rows.length === 0 && (
                <div className="ct-empty">
                  {t("client.trajets.empty")}
                  <div>
                    <Link to="/reserver">
                      <Plus size={13} /> {t("client.trajets.new_reservation")}
                    </Link>
                  </div>
                </div>
              )}

              {!loading && rows && rows.length > 0 && (
                <div className="ct-list">
                  {rows.map((r) => {
                    const meta = STATUS_KEY[r.status] || { key: r.status, bg: "rgba(255,255,255,0.08)", fg: "#fff" };
                    const dest = r.arrivee || r.destination || "—";
                    return (
                      <div className="ct-ride" key={r.id}>
                        <div className="ct-ride-top">
                          <span className="ct-ride-icon">
                            <Car size={16} />
                          </span>
                          <span className="ct-ride-when">
                            <Calendar size={12} /> {fmtDate(r.pickup_datetime)}
                          </span>
                          <span className="ct-status" style={{ background: meta.bg, color: meta.fg }}>
                            {t(meta.key)}
                          </span>
                        </div>
                        <div className="ct-route">
                          <MapPin size={14} className="shrink-0" style={{ color: "#e8bd5d", marginTop: 2 }} />
                          <div>
                            <span>{r.depart}</span>
                            <ArrowRight size={13} className="mx-1 inline" style={{ opacity: 0.4 }} />
                            <span>{dest}</span>
                          </div>
                        </div>
                        {(r.final_price ?? r.prix_estime) != null && (
                          <div className="ct-price">
                            {r.final_price != null
                              ? t("client.trajets.final_price")
                              : t("client.trajets.estimated")}{" "}
                            : <b>{Number(r.final_price ?? r.prix_estime).toFixed(2)} €</b>
                          </div>
                        )}
                        <div className="ct-actions">
                          <a
                            href={r.suivi_id ? `/suivi/${r.suivi_id}` : `/reservation/${r.id}`}
                            className="primary"
                          >
                            <Eye size={12} /> {t("client.trajets.follow")}
                          </a>
                          <button
                            onClick={() =>
                              shareRideTracking({
                                id: r.id,
                                suivi_id: r.suivi_id,
                                tracking_id: r.tracking_id,
                                depart: r.depart,
                                destination: r.arrivee || r.destination,
                              })
                            }
                          >
                            <Share2 size={12} /> {t("client.trajets.share")}
                          </button>
                          <Link to="/client/dashboard" className="secondary">
                            {t("client.trajets.details")} <ChevronRight size={12} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
        <ClientBottomNav />
      </div>
    </>
  );
}
