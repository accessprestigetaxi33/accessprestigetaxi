// Onglets propres à Access Prestige Taxi (Avis, Devis, Clients, Stats,
// Historique, Simulateur, Appareils), repris tels quels de l'ancien driver.tsx
// et branchés sur le nouveau socle (basé sur Nova).
// À placer dans : src/components/AptExtraTabs.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { loadGoogleMapsWhenVisible } from "@/lib/googleMaps";
import { geocodeAddress } from "@/lib/googleGeocode";
import { useServerFn } from "@tanstack/react-start";
import { estTarifJourParis, parseAsParisTime, TARIFS } from "@/lib/tarif";
import { broadcastDriverFeed } from "@/lib/suivi-broadcast";
import { getActiveVisitorCount } from "@/lib/driver-auth.functions";
import { driverListReservations, driverDeleteClient } from "@/lib/driver-data.functions";
import { getDriverStats, listReservationEvents, getTrackingAnalytics } from "@/lib/driver-stats.functions";
import { listDriverDevices, revokeDriverDevice, driverPushLog } from "@/lib/driver-devices.functions";
import { listDriverDevis, driverUpdateDevis, driverDeleteDevis, type Devis } from "@/lib/driver-devis.functions";
import { getDriverToken } from "@/lib/driver-token";

/** Styles propres à ces onglets, isolés sous `.apt-extra` pour ne pas toucher au thème Nova. */
export const aptExtraCss = `
@media (hover: hover) and (pointer: fine) {
  .apt-extra .drv-btn-primary:hover {background: #1e293b; }
  .apt-extra .drv-btn-danger:hover {background: #fee2e2; }
  .apt-extra .drv-card:hover {border-color: #c99b4a; }
}
.apt-extra .drv-section {font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 10px; }
.apt-extra .drv-card {background: #FDFBF7; border: 1px solid rgba(201,155,74,.45); border-radius: 16px; padding: 14px; margin-bottom: 10px; }
.apt-extra .drv-swipe {position: relative; margin-bottom: 10px; border-radius: 16px; overflow: hidden; }
.apt-extra .drv-swipe .drv-card {margin-bottom: 0; }
.apt-extra .drv-swipe-content {position: relative; z-index: 1; touch-action: pan-y; will-change: transform; }
.apt-extra .drv-swipe-action {position: absolute; top: 0; right: 0; bottom: 0; width: 96px; z-index: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; background: #dc2626; color: #fff; border: none; font-size: 20px; font-weight: 700; cursor: pointer; }
.apt-extra .drv-swipe-action span {font-size: 11px; font-weight: 700; letter-spacing: .04em; }
.apt-extra .drv-card.pending {border-color: #f59e0b; }
.apt-extra .drv-card.new {border-color: #3b82f6; box-shadow: 0 0 0 3px #3b82f620; }
.apt-extra .drv-card.done {opacity: 0.5; }
.apt-extra .drv-card.accepted {border-color: #22c55e; }
.apt-extra .drv-card.refused {border-color: #ef4444; opacity: 0.6; }
.apt-extra .drv-row {display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.apt-extra .drv-name {font-size: 14px; font-weight: 600; color: #0f172a; }
.apt-extra .drv-sub {font-size: 12px; color: #64748b; }
.apt-extra .drv-route {display: flex; flex-direction: column; gap: 4px; margin: 8px 0; }
.apt-extra .drv-route span {display: flex; align-items: flex-start; gap: 6px; font-size: 13px; color: #334155; line-height: 1.4; }
.apt-extra .drv-meta {display: flex; gap: 12px; font-size: 12px; color: #64748b; margin: 8px 0 12px; flex-wrap: wrap; }
.apt-extra .drv-meta span {display: flex; align-items: center; gap: 4px; }
.apt-extra .drv-btns {display: flex; gap: 8px; }
.apt-extra .drv-btn-primary {flex: 1; min-height: 46px; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; }
.apt-extra .drv-btn-primary:active {background: #1e293b; }
.apt-extra .drv-btn-danger {flex: 1; min-height: 46px; border: 1px solid #fecaca; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
.apt-extra .drv-btn-danger:active {background: #fee2e2; }
.apt-extra .drv-badge-pill {font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 99px; }
.apt-extra .drv-badge-blue { }
.apt-extra .drv-badge-green { }
.apt-extra .drv-badge-amber {background: #FDFBF7beb; color: #92400e; }
.apt-extra .drv-badge-gray { }
.apt-extra .drv-stars {color: #f59e0b; font-size: 15px; letter-spacing: 1px; }
.apt-extra .drv-stars-empty {color: var(--border); font-size: 15px; }
.apt-extra .drv-stat-grid {display: grid; }
.apt-extra .drv-stat { }
.apt-extra .drv-stat-lbl {margin-bottom: 4px; }
.apt-extra .drv-stat-val {font-weight: 800; }
.apt-extra .drv-stat-sub {margin-top: 2px; }
.apt-extra .drv-empty {text-align: center; padding: 50px 20px; color: #94a3b8; }
.apt-extra .drv-empty svg {width: 40px; height: 40px; margin-bottom: 10px; opacity: 0.4; }
.apt-extra .drv-divider {border: none; border-top: 1px solid rgba(201,155,74,.25); margin: 16px 0; }
.apt-extra .drv-visitor-dot-active {animation: drv-pulse 2s ease-in-out infinite; }
@media (max-width: 380px) {
  .apt-extra .drv-stat-val {font-size: 20px; }
}
.apt-extra .drv-stat-grid {grid-template-columns:repeat(2,1fr) !important; gap:8px !important; margin-bottom:10px !important; }
.apt-extra .drv-stat {background:linear-gradient(180deg,#0a1118,#050a10) !important; border:1px solid rgba(201,155,74,.45); border-radius:9px !important; padding:11px !important; display:grid !important; grid-template-columns:minmax(0,1fr) auto; align-items:center; column-gap:8px; }
.apt-extra .drv-stat-lbl {grid-column:1; grid-row:1; margin:0 !important; color:rgba(246,240,229,.55) !important; font-size:8.5px !important; letter-spacing:.08em; font-weight:800; line-height:1.25; }
.apt-extra .drv-stat-val {grid-column:2; grid-row:1 / span 2; justify-self:end; text-align:right; white-space:nowrap; color:#e0b866 !important; font-size:22px !important; line-height:1.1; }
.apt-extra .drv-stat-sub {grid-column:1; grid-row:2; margin:0 !important; color:rgba(246,240,229,.45) !important; font-size:9px !important; line-height:1.2; }
@media (max-width:340px) {
  .apt-extra .drv-stat-val {font-size:18px !important; }
}
@media (min-width:1024px) {
  .apt-extra .drv-card {padding: 16px; }
}
.apt-extra .drv-card {background:#050a10 !important; border-color:rgba(201,155,74,.45) !important; color:#f6f0e5 !important; }
.apt-extra .drv-name, .apt-extra .drv-route span, .apt-extra .drv-section {color:#f6f0e5 !important; }
.apt-extra .drv-sub, .apt-extra .drv-meta {color:rgba(246,240,229,.55) !important; }
.apt-extra .drv-btn-primary {background:#050a10 !important; color:#fff !important; border:1px solid #e0b866 !important; }
.apt-extra .drv-btn-danger {background:#1b0c0c !important; color:#f0a0a0 !important; border-color:#8b3a3a !important; }
.apt-extra .drv-badge-blue {background:#17243a !important; color:#9fc2ff !important; }
.apt-extra .drv-badge-green {background:#10271b !important; color:#8ee39f !important; }
.apt-extra .drv-badge-gray {background:#111820 !important; color:#c8c0b2 !important; }
@media (max-width:700px) {
  .apt-extra .drv-btns {gap:7px !important; }
}
@keyframes drv-pulse {0%, 100% { opacity:1; box-shadow: 0 0 0 3px rgba(34,197,94,0.3); } 50% { opacity:0.6; box-shadow: 0 0 0 6px rgba(34,197,94,0.1); } }
`;

interface Resa {
  id: string;
  depart: string;
  destination: string;
  date_heure: string;
  pickup_datetime: string;
  status: string;
  prix_estime?: number | null;
  final_price?: number | null;
  distance_km?: number | null;
  client_name?: string | null;
  client_phone?: string | null;
  client_email?: string | null;
  email?: string | null;
  suivi_id?: string | null;
  message?: string | null;
}

interface Avis {
  id: string;
  author_name: string;
  note: number;
  commentaire: string | null;
  created_at: string;
  status: string;
}

interface ClientAgg {
  id?: string;
  phone: string;
  email?: string | null;
  name: string;
  nbCourses: number;
  totalDepense: number;
  derniereCourse: string;
  derniereDepart: string;
  derniereDestination: string;
}

interface RouteOption {
  index: number;
  summary: string;
  distanceKm: number;
  dureeMin: number;
  prix_estime: number;
  tarifLabel: string;
  legs: any[];
  overview_polyline: string;
  dirResult: any;
  originLatLng: { lat: number; lng: number };
  destLatLng: { lat: number; lng: number };
  waypointLatLng: { lat: number; lng: number } | null;
}

function Stars({ n }: { n: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= n ? "drv-stars" : "drv-stars-empty"}>
          ★
        </span>
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ── Swipe-to-delete générique (réutilisé par Devis / Avis / Clients) ───────
// Même logique que le swipe des courses (CoursesTab) mais factorisée pour
// pouvoir être posée sur n'importe quelle carte : glisser vers la gauche
// révèle le bouton 🗑 rouge, qui appelle `onDelete`.
function SwipeToDeleteCard({
  onDelete,
  deleting,
  ariaLabel,
  cardClassName,
  children,
}: {
  onDelete: () => void;
  deleting?: boolean;
  ariaLabel: string;
  cardClassName?: string;
  children: React.ReactNode;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const swipeStart = useRef<{ x: number; y: number; base: number } | null>(null);
  const swipeLock = useRef<"none" | "x" | "y">("none");
  const SWIPE_MAX = 88;

  const onSwipeStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    swipeStart.current = { x: t.clientX, y: t.clientY, base: swipeX };
    swipeLock.current = "none";
  };
  const onSwipeMove = (e: React.TouchEvent) => {
    const s = swipeStart.current;
    const t = e.touches[0];
    if (!s || !t) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (swipeLock.current === "none") {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      swipeLock.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (swipeLock.current !== "x") return;
    const next = Math.min(0, Math.max(-SWIPE_MAX - 24, s.base + dx));
    setSwipeX(next);
  };
  const onSwipeEnd = () => {
    if (swipeLock.current === "x") setSwipeX(swipeX < -SWIPE_MAX / 2 ? -SWIPE_MAX : 0);
    swipeStart.current = null;
    swipeLock.current = "none";
  };

  // Referme le tiroir une fois la suppression lancée (évite un bouton
  // "collé" ouvert sur une carte qui va disparaître de la liste).
  useEffect(() => {
    if (deleting) setSwipeX(0);
  }, [deleting]);

  return (
    <div className="drv-swipe">
      <button type="button" className="drv-swipe-action" aria-label={ariaLabel} onClick={onDelete} disabled={deleting}>
        {deleting ? "…" : "🗑"}
        <span>Suppr.</span>
      </button>
      <div
        className={`drv-card drv-swipe-content${cardClassName ? ` ${cardClassName}` : ""}`}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swipeStart.current ? "none" : "transform .22s ease",
        }}
        onTouchStart={onSwipeStart}
        onTouchMove={onSwipeMove}
        onTouchEnd={onSwipeEnd}
        onTouchCancel={onSwipeEnd}
      >
        {children}
      </div>
    </div>
  );
}

// ── Onglet Avis ────────────────────────────────────────────────────────────
export function AvisTab({ onBadgeChange }: { onBadgeChange: (n: number) => void }) {
  const [pending, setPending] = useState<Avis[]>([]);
  const [published, setPublished] = useState<Avis[]>([]);
  const [flagged, setFlagged] = useState<Avis[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      if (!getDriverToken()) {
        return;
      }
      const response = await fetch(`/api/public/reviews?token=${encodeURIComponent(getDriverToken())}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "chargement impossible");
      setPending(result.pending ?? []);
      setPublished(result.published ?? []);
      setFlagged(result.flagged ?? []);
      onBadgeChange((result.pending ?? []).length);
    } catch (e: any) {
      toast.error("Impossible de charger les avis : " + (e.message ?? e));
    }
  }, [onBadgeChange]);

  useEffect(() => {
    load();
    const ch = (supabase as any)
      .channel("driver-feed", { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "reservation" }, load)
      .subscribe();
    const poll = setInterval(load, 8000);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      supabase.removeChannel(ch);
    };
  }, [load]);

  const moderate = async (id: string, action: "approved" | "refused" | "flagged" | "pending") => {
    setBusy(id);
    try {
      const response = await fetch("/api/public/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-driver-token": getDriverToken() },
        body: JSON.stringify({ id, status: action }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "modération impossible");
      toast.success(
        action === "approved"
          ? "Avis publié ✓"
          : action === "flagged"
            ? "Avis signalé et retiré du site"
            : action === "pending"
              ? "Avis remis en attente"
              : "Avis refusé",
      );
      load();
      broadcastDriverFeed("review-moderated");
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  const removeAvis = async (id: string) => {
    if (!confirm("Supprimer définitivement cet avis ?")) return;
    setBusy(id);
    try {
      const response = await fetch("/api/public/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-driver-token": getDriverToken() },
        body: JSON.stringify({ id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "suppression impossible");
      toast.success("Avis supprimé");
      load();
      broadcastDriverFeed("review-deleted");
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  const avgNote =
    published.length > 0 ? (published.reduce((s, a) => s + a.note, 0) / published.length).toFixed(1) : null;

  return (
    <>
      {pending.length > 0 && (
        <>
          <p className="drv-section">À modérer ({pending.length})</p>
          {pending.map((a) => (
            <SwipeToDeleteCard
              key={a.id}
              onDelete={() => removeAvis(a.id)}
              deleting={busy === a.id}
              ariaLabel="Supprimer cet avis"
              cardClassName="pending"
            >
              <div className="drv-row">
                <span className="drv-name">{a.author_name || "Anonyme"}</span>
                <span className="drv-badge-pill drv-badge-amber">En attente</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <Stars n={a.note} />
              </div>
              <p style={{ fontSize: 13, color: "#334155", margin: "0 0 12px", lineHeight: 1.5 }}>"{a.commentaire}"</p>
              <div className="drv-btns">
                <button className="drv-btn-danger" disabled={!!busy} onClick={() => moderate(a.id, "refused")}>
                  {busy === a.id ? "…" : "Refuser"}
                </button>
                <button className="drv-btn-primary" disabled={!!busy} onClick={() => moderate(a.id, "approved")}>
                  {busy === a.id ? "…" : "Publier sur le site"}
                </button>
                <button
                  className="drv-btn-danger"
                  disabled={!!busy}
                  onClick={() => moderate(a.id, "flagged")}
                  title="Signaler comme abusif"
                >
                  {busy === a.id ? "…" : "⚑ Signaler"}
                </button>
              </div>
            </SwipeToDeleteCard>
          ))}
          <hr className="drv-divider" />
        </>
      )}

      {flagged.length > 0 && (
        <>
          <p className="drv-section">Avis signalés ({flagged.length})</p>
          {flagged.map((a) => (
            <SwipeToDeleteCard
              key={a.id}
              onDelete={() => removeAvis(a.id)}
              deleting={busy === a.id}
              ariaLabel="Supprimer cet avis"
            >
              <div className="drv-row">
                <span className="drv-name">{a.author_name || "Anonyme"}</span>
                <span className="drv-badge-pill drv-badge-amber">Signalé</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <Stars n={a.note} />
              </div>
              <p style={{ fontSize: 13, color: "#334155", margin: "0 0 12px", lineHeight: 1.5 }}>"{a.commentaire}"</p>
              <div className="drv-btns">
                <button className="drv-btn-danger" disabled={!!busy} onClick={() => removeAvis(a.id)}>
                  {busy === a.id ? "…" : "Supprimer"}
                </button>
                <button className="drv-btn-primary" disabled={!!busy} onClick={() => moderate(a.id, "pending")}>
                  {busy === a.id ? "…" : "Remettre en attente"}
                </button>
              </div>
            </SwipeToDeleteCard>
          ))}
          <hr className="drv-divider" />
        </>
      )}

      <p className="drv-section">Avis publiés</p>
      {published.length === 0 ? (
        <div className="drv-empty">
          <div style={{ fontSize: 13 }}>Aucun avis publié</div>
        </div>
      ) : (
        <>
          {published.map((a) => (
            <SwipeToDeleteCard
              key={a.id}
              onDelete={() => removeAvis(a.id)}
              deleting={busy === a.id}
              ariaLabel="Supprimer cet avis"
            >
              <div style={{ opacity: 0.75 }}>
                <div className="drv-row">
                  <span className="drv-name">{a.author_name || "Anonyme"}</span>
                  <span className="drv-badge-pill drv-badge-green">Publié</span>
                </div>
                <div style={{ marginBottom: 4 }}>
                  <Stars n={a.note} />
                </div>
                <p style={{ fontSize: 13, color: "#475569", margin: "0 0 8px", lineHeight: 1.5 }}>"{a.commentaire}"</p>
                <button
                  onClick={() => removeAvis(a.id)}
                  disabled={busy === a.id}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#b91c1c",
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {busy === a.id ? "…" : "🗑 Supprimer"}
                </button>
                <button
                  onClick={() => moderate(a.id, "flagged")}
                  disabled={busy === a.id}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#b45309",
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                    marginLeft: 12,
                  }}
                >
                  {busy === a.id ? "…" : "⚑ Signaler"}
                </button>
              </div>
            </SwipeToDeleteCard>
          ))}
          {avgNote && (
            <div
              style={{
                textAlign: "center",
                marginTop: 20,
                padding: "16px 0",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Note moyenne publiée</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#0f172a" }}>{avgNote}</div>
              <div style={{ fontSize: 22, color: "#f59e0b" }}>★★★★★</div>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ── Onglet Devis ─────────────────────────────────────────────────────────
export function DevisTab({ onBadgeChange }: { onBadgeChange: (n: number) => void }) {
  const [items, setItems] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { reponse: string; prix: string }>>({});

  const load = useCallback(async () => {
    try {
      if (!getDriverToken()) {
        return;
      }
      const res: any = await listDriverDevis({ data: { token: getDriverToken() } });
      setItems((res?.devis ?? []) as Devis[]);
      onBadgeChange(res?.pending ?? 0);
    } catch (e: any) {
      toast.error("Impossible de charger les devis : " + (e.message ?? e));
    } finally {
      setLoading(false);
    }
  }, [onBadgeChange]);

  useEffect(() => {
    load();
    const poll = setInterval(load, 8000);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [load]);

  const defaultDraft = (d: Devis) => ({
    reponse: d.reponse ?? "",
    prix: d.prix_propose != null ? String(d.prix_propose) : "",
  });
  const draftFor = (d: Devis) => drafts[d.id] ?? defaultDraft(d);
  const setDraft = (d: Devis, patch: Partial<{ reponse: string; prix: string }>) => {
    setDrafts((prev) => ({ ...prev, [d.id]: { ...(prev[d.id] ?? defaultDraft(d)), ...patch } }));
  };

  const changeStatut = async (id: string, statut: "traite" | "accepte" | "refuse") => {
    setBusy(id);
    try {
      await driverUpdateDevis({
        data: { token: getDriverToken(), devis_id: id, patch: { statut } },
      });
      toast.success(
        statut === "accepte" ? "Devis marqué accepté ✓" : statut === "refuse" ? "Devis refusé" : "Devis marqué traité",
      );
      load();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  const sendReponse = async (d: Devis) => {
    const draft = draftFor(d);
    const prixTrim = draft.prix.trim();
    const prix = prixTrim ? parseFloat(prixTrim.replace(",", ".")) : null;
    if (prixTrim && (prix == null || isNaN(prix) || prix < 0)) {
      toast.error("Prix proposé invalide");
      return;
    }
    setBusy(d.id);
    try {
      await driverUpdateDevis({
        data: {
          token: getDriverToken(),
          devis_id: d.id,
          patch: { reponse: draft.reponse.trim(), prix_propose: prix, statut: "traite" },
        },
      });
      toast.success("Réponse enregistrée ✓");
      load();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  const removeDevis = async (id: string) => {
    if (!confirm("Supprimer définitivement ce devis ?")) return;
    setBusy(id);
    try {
      await driverDeleteDevis({ data: { token: getDriverToken(), devis_id: id } });
      toast.success("Devis supprimé");
      load();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  if (loading)
    return (
      <div className="drv-empty">
        <div style={{ fontSize: 14 }}>Chargement…</div>
      </div>
    );

  const statutLabel: Record<string, { label: string; cls: string }> = {
    recu: { label: "Reçu", cls: "drv-badge-blue" },
    traite: { label: "Traité", cls: "drv-badge-amber" },
    accepte: { label: "Accepté", cls: "drv-badge-green" },
    refuse: { label: "Refusé", cls: "drv-badge-gray" },
  };

  if (items.length === 0)
    return (
      <div className="drv-empty">
        <div style={{ fontSize: 14, fontWeight: 600 }}>Aucune demande de devis</div>
      </div>
    );

  return (
    <>
      {items.map((d) => {
        const st = statutLabel[d.statut] ?? { label: d.statut, cls: "drv-badge-gray" };
        const isOpen = expandedId === d.id;
        const draft = draftFor(d);
        return (
          <SwipeToDeleteCard
            key={d.id}
            onDelete={() => removeDevis(d.id)}
            deleting={busy === d.id}
            ariaLabel="Supprimer ce devis"
          >
            <div
              style={{ cursor: "pointer" }}
              onClick={() => setExpandedId(isOpen ? null : d.id)}
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpandedId(isOpen ? null : d.id);
                }
              }}
            >
              <div className="drv-row">
                <span className="drv-name">{d.nom}</span>
                <span className={`drv-badge-pill ${st.cls}`}>{st.label}</span>
              </div>
              <div className="drv-route">
                <span>📍 {d.depart}</span>
                <span>🏁 {d.arrivee}</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                {d.date_souhaitee ? `${d.date_souhaitee} ` : ""}
                {d.heure_souhaitee ?? ""}
                {d.aller_retour ? " · aller-retour" : ""}
                {" · "}
                {d.passagers} pers.{d.bagages ? ` · ${d.bagages} bagage(s)` : ""}
              </div>
              {(d.transport_sanitaire || d.fauteuil_roulant || d.transport_groupe || d.sieges_enfant) && (
                <div style={{ fontSize: 12, color: "#b45309", marginTop: 4 }}>
                  {[
                    d.transport_sanitaire && "Transport sanitaire",
                    d.fauteuil_roulant && "Fauteuil roulant",
                    d.transport_groupe && "Groupe",
                    d.sieges_enfant && "Siège enfant",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              )}
              {d.precisions && (
                <p style={{ fontSize: 13, color: "#334155", margin: "8px 0 0", lineHeight: 1.5 }}>{d.precisions}</p>
              )}
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                ✉️ {d.email}
                {d.telephone ? ` · ☎ ${d.telephone}` : ""}
              </div>
              <button
                type="button"
                className="drv-btn-primary"
                style={{ width: "100%", marginTop: 10 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedId(isOpen ? null : d.id);
                }}
              >
                {isOpen ? "▲ Masquer le détail" : "👁 Voir / Répondre"}
              </button>
            </div>

            {isOpen && (
              <>
                <hr className="drv-divider" />
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Prix proposé (€)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={draft.prix}
                  onChange={(e) => setDraft(d, { prix: e.target.value })}
                  placeholder="Ex. 85"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    marginBottom: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    fontSize: 14,
                  }}
                />
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Réponse au client</label>
                <textarea
                  value={draft.reponse}
                  onChange={(e) => setDraft(d, { reponse: e.target.value })}
                  rows={3}
                  placeholder="Votre réponse…"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    marginBottom: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    fontSize: 14,
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
                <div className="drv-btns">
                  <button className="drv-btn-danger" disabled={busy === d.id} onClick={() => removeDevis(d.id)}>
                    {busy === d.id ? "…" : "Supprimer"}
                  </button>
                  <button className="drv-btn-primary" disabled={busy === d.id} onClick={() => sendReponse(d)}>
                    {busy === d.id ? "…" : "Enregistrer la réponse"}
                  </button>
                </div>
                <div className="drv-btns" style={{ marginTop: 8 }}>
                  <button
                    className="drv-btn-danger"
                    disabled={busy === d.id}
                    onClick={() => changeStatut(d.id, "refuse")}
                  >
                    ✖ Refuser
                  </button>
                  <button
                    className="drv-btn-primary"
                    disabled={busy === d.id}
                    onClick={() => changeStatut(d.id, "accepte")}
                  >
                    ✓ Accepter
                  </button>
                </div>
              </>
            )}
          </SwipeToDeleteCard>
        );
      })}
    </>
  );
}

// ── Onglet Clients ──────────────────────────────────────────────────────────
export function ClientsTab() {
  const [clients, setClients] = useState<ClientAgg[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    if (!getDriverToken()) {
      setLoading(false);
      return;
    }
    const res: any = await driverListReservations({
      data: { token: getDriverToken(), scope: "clients" },
    });
    const data: any[] = res?.rows ?? [];
    const clientsRows: any[] = res?.clients ?? [];

    const normalize = (p: string) => p.replace(/[^0-9]/g, "").replace(/^0/, "33");
    const idByPhone = new Map<string, string>();
    for (const c of (clientsRows ?? []) as any[]) {
      if (c.phone) idByPhone.set(normalize(c.phone), c.id);
    }

    // Clé d'agrégation normalisée (comme idByPhone ci-dessus) : sans ça, un
    // même client ayant réservé avec des formats différents ("0612345678",
    // "+33612345678", avec espaces…) apparaissait comme plusieurs clients
    // distincts, avec historique et total dépensé scindés entre les fiches.
    const rows: any[] = data ?? [];
    const byPhone = new Map<string, ClientAgg>();
    for (const r of rows) {
      const phone = r.client_phone;
      if (!phone) continue;
      const key = normalize(phone);
      const existing = byPhone.get(key);
      const isCompleted = ["terminee", "completed"].includes(r.status);
      if (!existing) {
        byPhone.set(key, {
          id: idByPhone.get(normalize(phone)),
          phone,
          email: r.client_email ?? r.email ?? null,
          name: r.client_name || "Client",
          nbCourses: isCompleted ? 1 : 0,
          totalDepense: isCompleted ? (r.prix_estime ?? 0) : 0,
          derniereCourse: r.pickup_datetime ?? r.date_heure,
          derniereDepart: r.depart ?? "",
          derniereDestination: r.destination ?? "",
        });
      } else {
        if (isCompleted) {
          existing.nbCourses += 1;
          existing.totalDepense += r.prix_estime ?? 0;
        }
        if ((r.pickup_datetime ?? r.date_heure) > existing.derniereCourse) {
          existing.derniereCourse = r.pickup_datetime ?? r.date_heure;
          existing.derniereDepart = r.depart ?? existing.derniereDepart;
          existing.derniereDestination = r.destination ?? existing.derniereDestination;
        }
        if (!existing.name || existing.name === "Client") existing.name = r.client_name || existing.name;
        if (!existing.email && (r.client_email || r.email)) existing.email = r.client_email ?? r.email;
      }
    }

    setClients(Array.from(byPhone.values()).sort((a, b) => b.derniereCourse.localeCompare(a.derniereCourse)));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(load, 8000);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    const ch = (supabase as any)
      .channel("driver-feed-clients", { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "reservation" }, load)
      .subscribe();
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      supabase.removeChannel(ch);
    };
  }, [load]);

  const [deletingPhone, setDeletingPhone] = useState<string | null>(null);
  const removeClient = async (c: ClientAgg) => {
    if (!confirm(`Supprimer ${c.name} et toutes ses courses ? Action irréversible.`)) return;
    setDeletingPhone(c.phone);
    try {
      await driverDeleteClient({
        data: { token: getDriverToken(), phone: c.phone, client_id: c.id ?? null },
      });
      toast.success("Client supprimé");
      load();
    } catch (e: any) {
      toast.error("Suppression impossible : " + (e.message ?? e));
    } finally {
      setDeletingPhone(null);
    }
  };

  const formatE164 = (phone: string) => {
    const normalized = phone.replace(/[^0-9]/g, "").replace(/^0/, "33");
    return normalized.startsWith("33") ? `+${normalized}` : `+${normalized}`;
  };

  const makeVcardHref = (name: string, phone: string, email?: string | null) => {
    const tel = formatE164(phone);
    const safeName = name || "Client";
    const lines = [`BEGIN:VCARD`, `VERSION:3.0`, `FN:${safeName}`, `TEL;TYPE=CELL:${tel}`];
    if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);
    lines.push(`END:VCARD`);
    const vcard = lines.join(`\n`);
    return `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`;
  };

  if (loading)
    return (
      <div className="drv-empty">
        <div style={{ fontSize: 14 }}>Chargement…</div>
      </div>
    );

  const filtered = query.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query) ||
          (c.email?.toLowerCase().includes(query.toLowerCase()) ?? false),
      )
    : clients;

  return (
    <>
      <input
        type="text"
        placeholder="Rechercher un client…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          fontSize: 16,
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: 14,
          outline: "none",
        }}
      />

      {filtered.length === 0 ? (
        <div className="drv-empty">
          <div style={{ fontSize: 14, fontWeight: 600 }}>Aucun client trouvé</div>
        </div>
      ) : (
        filtered.map((c) => (
          <SwipeToDeleteCard
            key={c.phone}
            onDelete={() => removeClient(c)}
            deleting={deletingPhone === c.phone}
            ariaLabel="Supprimer ce client"
          >
            <div className="drv-row">
              <span className="drv-name">{c.name}</span>
              <span className="drv-badge-pill drv-badge-gray">
                {c.nbCourses} course{c.nbCourses > 1 ? "s" : ""}
              </span>
            </div>
            <div className="drv-sub" style={{ marginBottom: 6 }}>
              Dernière course : {formatDate(c.derniereCourse)}
              <br />
              <span>📍 {c.derniereDepart || "—"}</span>
              <br />
              <span>🏁 {c.derniereDestination || "—"}</span>
            </div>
            <div
              className="drv-meta"
              style={{ margin: "8px 0 12px", flexDirection: "column", display: "flex", gap: 6 }}
            >
              <span>📞 {c.phone}</span>
              {c.email ? <span>✉ {c.email}</span> : null}
              <span>💶 {c.totalDepense.toFixed(2)} € au total</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href={`tel:${c.phone}`}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 12,
                  padding: "10px",
                  color: "#15803d",
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                📞 Appeler
              </a>
              <a
                href={`sms:${c.phone}`}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 12,
                  padding: "10px",
                  color: "#1d4ed8",
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                💬 SMS
              </a>
              <a
                href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "").replace(/^0/, "33")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 12,
                  padding: "10px",
                  color: "#15803d",
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                🟢 WhatsApp
              </a>
            </div>
            <a
              href={makeVcardHref(c.name, c.phone, c.email)}
              download={`${c.name.replace(/[^a-zA-Z0-9]/g, "_") || "client"}.vcf`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                width: "100%",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 12,
                padding: "10px",
                color: "#1e40af",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                marginTop: 8,
              }}
            >
              📇 Enregistrer
            </a>
            <button
              onClick={() => removeClient(c)}
              disabled={deletingPhone === c.phone}
              style={{
                width: "100%",
                marginTop: 8,
                background: "none",
                border: "none",
                color: "#b91c1c",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              {deletingPhone === c.phone ? "Suppression…" : "🗑 Supprimer ce client"}
            </button>
          </SwipeToDeleteCard>
        ))
      )}
    </>
  );
}

// (ChatTab et DriverChatConversation retirés : le chat "haut de page" n'est
// plus affiché ; les échanges se font uniquement dans chaque carte de course.)

// ── Analytics : ouvertures du lien de suivi ────────────────────────────────
function TrackingAnalytics() {
  const trackingAnalyticsFn = useServerFn(getTrackingAnalytics);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    totalOuvertures: number;
    coursesAvecSuivi: number;
    totalCourses: number;
    tauxOuverture: number;
    parJour: { jour: string; count: number }[];
    parSource: { source: string; count: number }[];
    dernierEvents: {
      reservation_id: string;
      client_name: string | null;
      created_at: string;
      source: string | null;
    }[];
  } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const since30j = new Date();
      since30j.setDate(since30j.getDate() - 30);

      const tok = getDriverToken();
      if (!tok) {
        setLoading(false);
        return;
      }
      const { events, totalCourses } = await trackingAnalyticsFn({
        data: { token: tok, days: 30 },
      });

      const evts: any[] = events ?? [];

      const uniqueResas = new Set(evts.map((e: any) => e.reservation_id));

      const parJourMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        parJourMap.set(d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }), 0);
      }
      const sept = new Date();
      sept.setDate(sept.getDate() - 6);
      sept.setHours(0, 0, 0, 0);
      for (const e of evts) {
        const d = new Date(e.created_at);
        if (d >= sept) {
          const k = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
          parJourMap.set(k, (parJourMap.get(k) ?? 0) + 1);
        }
      }
      const parJour = Array.from(parJourMap.entries()).map(([jour, count]) => ({ jour, count }));

      const parSourceMap = new Map<string, number>();
      for (const e of evts) {
        const src = e.source ?? "direct";
        parSourceMap.set(src, (parSourceMap.get(src) ?? 0) + 1);
      }
      const parSource = Array.from(parSourceMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

      const dernierEvents = evts.slice(0, 5).map((e: any) => ({
        reservation_id: e.reservation_id,
        client_name: e.client_name ?? null,
        created_at: e.created_at,
        source: e.source ?? "direct",
      }));

      const tauxOuverture = totalCourses && totalCourses > 0 ? Math.round((uniqueResas.size / totalCourses) * 100) : 0;

      setData({
        totalOuvertures: evts.length,
        coursesAvecSuivi: uniqueResas.size,
        totalCourses,
        tauxOuverture,
        parJour,
        parSource,
        dernierEvents,
      });
    } catch (e) {
      console.error("[TrackingAnalytics]", e);
    } finally {
      setLoading(false);
    }
  };

  const sourceEmoji: Record<string, string> = {
    push: "🔔",
    email: "✉️",
    sms: "💬",
    whatsapp: "🟢",
    direct: "🔗",
  };

  const maxJour = data ? Math.max(...data.parJour.map((d) => d.count), 1) : 1;

  return (
    <div style={{ marginTop: 4, marginBottom: 4 }}>
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && !data) load();
        }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: open ? "#0f172a" : "#f8fafc",
          border: `1px solid ${open ? "#0f172a" : "#e2e8f0"}`,
          borderRadius: 14,
          padding: "12px 16px",
          fontSize: 13,
          fontWeight: 700,
          color: open ? "#FDFBF7" : "#0f172a",
          cursor: "pointer",
          marginBottom: open ? 10 : 0,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <span>📈 Analytics — Suivi client</span>
        <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>30 derniers jours {open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="drv-card" style={{ borderRadius: 14, padding: 16 }}>
          {loading ? (
            <div style={{ textAlign: "center", fontSize: 13, color: "#64748b", padding: "20px 0" }}>Chargement…</div>
          ) : !data ? (
            <div style={{ textAlign: "center", fontSize: 13, color: "#64748b", padding: "20px 0" }}>Aucune donnée</div>
          ) : (
            <>
              {/* KPIs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: "10px 8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{data.totalOuvertures}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Ouvertures</div>
                </div>
                <div
                  style={{
                    background: "#f0fdf4",
                    borderRadius: 12,
                    padding: "10px 8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#15803d" }}>{data.tauxOuverture}%</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Taux suivi</div>
                </div>
                <div
                  style={{
                    background: "#eff6ff",
                    borderRadius: 12,
                    padding: "10px 8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#1d4ed8" }}>
                    {data.coursesAvecSuivi}/{data.totalCourses}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Courses</div>
                </div>
              </div>

              {/* Graphique 7 jours */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94a3b8",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                7 derniers jours
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 4,
                  height: 56,
                  marginBottom: 4,
                }}
              >
                {data.parJour.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        borderRadius: "4px 4px 0 0",
                        background: i === data.parJour.length - 1 ? "#0f172a" : "#bfdbfe",
                        height: `${Math.max(4, Math.round((d.count / maxJour) * 44))}px`,
                        transition: "height 0.3s ease",
                        position: "relative",
                      }}
                    >
                      {d.count > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: -16,
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {d.count}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                {data.parJour.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 9,
                      color: i === data.parJour.length - 1 ? "#0f172a" : "#94a3b8",
                      fontWeight: i === data.parJour.length - 1 ? 700 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.jour}
                  </div>
                ))}
              </div>

              {/* Par source */}
              {data.parSource.length > 0 && (
                <>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Provenance
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                    {data.parSource.map((s) => {
                      const total = data.parSource.reduce((acc, x) => acc + x.count, 0);
                      const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                      return (
                        <div key={s.source} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              width: 70,
                              fontSize: 12,
                              color: "#334155",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {sourceEmoji[s.source] ?? "🔗"} {s.source}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              background: "#f1f5f9",
                              borderRadius: 4,
                              overflow: "hidden",
                              height: 8,
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: "#0f172a",
                                borderRadius: 4,
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#0f172a",
                              width: 32,
                              textAlign: "right",
                            }}
                          >
                            {s.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Dernières ouvertures */}
              {data.dernierEvents.length > 0 && (
                <>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Dernières ouvertures
                  </div>
                  {data.dernierEvents.map((e, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom: i < data.dernierEvents.length - 1 ? "1px solid #f1f5f9" : "none",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                          {e.client_name ?? "Client"}
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>
                          {sourceEmoji[e.source ?? "direct"] ?? "🔗"} {e.source ?? "direct"} · #
                          {e.reservation_id.slice(0, 6)}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "right" }}>
                        {new Date(e.created_at).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {data.totalOuvertures === 0 && (
                <div style={{ textAlign: "center", padding: "16px 0", color: "#94a3b8", fontSize: 12 }}>
                  Aucune ouverture enregistrée sur cette période.
                  <br />
                  <span style={{ fontSize: 11 }}>
                    Assure-toi que <code>suivi.$id.tsx</code> insère bien dans <code>tracking_events</code>.
                  </span>
                </div>
              )}

              <button
                onClick={load}
                disabled={loading}
                style={{
                  marginTop: 12,
                  width: "100%",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "8px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0f172a",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                🔄 Rafraîchir
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Visiteurs actifs en temps réel ───────────────────────────────────────────
function VisitorCounter({
  scope,
  title,
  emptyLabel,
  singleLabel,
  pluralLabel,
  subtitle,
  emoji,
}: {
  scope: "site" | "suivi";
  title: string;
  emptyLabel: string;
  singleLabel: string;
  pluralLabel: (n: number) => string;
  subtitle: string;
  emoji: string;
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      // Le nettoyage des visiteurs périmés se fait côté serveur (rôle service),
      // le client anonyme n'a aucun droit d'écriture sur active_visitors.

      try {
        if (!getDriverToken()) {
          setCount(0);
          return;
        }
        const res = await getActiveVisitorCount({ data: { token: getDriverToken(), scope } });
        setCount(res?.count ?? 0);
      } catch {
        setCount(0);
      }
    };

    fetchCount();
    const poll = setInterval(fetchCount, 15_000);

    return () => {
      clearInterval(poll);
    };
  }, [scope]);

  const isActive = count !== null && count > 0;

  return (
    <div
      className="drv-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        marginBottom: 4,
      }}
    >
      <span
        className={isActive ? "drv-visitor-dot-active" : undefined}
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: count === null ? "#94a3b8" : isActive ? "#22c55e" : "#e2e8f0",
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
          {count === null ? "…" : count === 0 ? emptyLabel : count === 1 ? singleLabel : pluralLabel(count)}
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
          {title} · {subtitle}
        </div>
      </div>
      {isActive && <span style={{ fontSize: 20 }}>{emoji}</span>}
    </div>
  );
}

function ActiveVisitors() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <VisitorCounter
        scope="site"
        title="Site"
        subtitle="visiteurs sur le site"
        emptyLabel="Aucun visiteur sur le site"
        singleLabel="1 visiteur sur le site"
        pluralLabel={(n) => `${n} visiteurs sur le site`}
        emoji="🌐"
      />
      <VisitorCounter
        scope="suivi"
        title="Suivi"
        subtitle="pages /suivi actives"
        emptyLabel="Personne sur une page suivi"
        singleLabel="1 client consulte son suivi"
        pluralLabel={(n) => `${n} clients consultent leur suivi`}
        emoji="👁"
      />
    </div>
  );
}

// ── Onglet Stats ────────────────────────────────────────────────────────────
export function SimulateurTab() {
  // Alias connus pour l'aéroport : "aéroport de bordeaux" seul est souvent mal
  // (ou pas) géocodé par Google, contrairement au nom officiel complet.
  // On normalise ici avant l'appel à geocodeAddress, quelle que soit la variante tapée.
  //
  // IMPORTANT : on ne matche jamais les accents sur le texte brut. Selon le
  // clavier/l'OS (iOS en particulier), un accent peut être saisi en forme
  // Unicode décomposée (e + accent combinant) plutôt que précomposée (é) —
  // une regex du type [ée] ne matche alors ni l'un ni l'autre de façon fiable.
  // On désaccentue donc d'abord tout le texte (comme dans reserver.tsx), puis
  // on matche sur des motifs ASCII purs.
  const stripAccents = (value: string): string =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const normalizeAddress = (raw: string): string => {
    const trimmed = raw.trim();
    const n = stripAccents(trimmed);
    if (/aeroport.*(bordeaux|merignac)|(bordeaux|merignac).*aeroport/.test(n)) {
      return "Aéroport de Bordeaux-Mérignac, France";
    }
    return trimmed;
  };

  const [mode, setMode] = useState<"manuel" | "adresses">("manuel");
  const [pickupLocal, setPickupLocal] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [distanceKm, setDistanceKm] = useState("");
  const [depart, setDepart] = useState("");

  const [arrivee, setArrivee] = useState("");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<{
    distanceKm: number;
    jourKm: number;
    nuitKm: number;
    prixJour: number;
    prixNuit: number;
    priseEnCharge: number;
    total: number;
    label: string;
  } | null>(null);

  // Découpage jour/nuit basé sur une durée interne uniquement — la durée
  // n'entre PAS dans le prix (tarif au km) et n'est jamais exposée dans l'UI
  // ni envoyée dans une requête.
  const computeBreakdown = (distKm: number, stepMinutes: number, pickupIso: string) => {
    const dureeS = Math.max(stepMinutes, 1) * 60;
    const pickupMs = parseAsParisTime(pickupIso).getTime();
    const stepsCount = Math.max(Math.round(dureeS / 60), 1);
    const stepMs = (dureeS * 1000) / stepsCount;
    const frac = distKm / stepsCount;
    let jourKm = 0;
    let nuitKm = 0;
    for (let s = 0; s < stepsCount; s++) {
      const t = new Date(pickupMs + s * stepMs).toISOString();
      if (estTarifJourParis(t)) jourKm += frac;
      else nuitKm += frac;
    }
    const prixJour = jourKm * TARIFS.TARIF_JOUR;
    const prixNuit = nuitKm * TARIFS.TARIF_NUIT;
    const total = Math.round((TARIFS.PRISE_EN_CHARGE + prixJour + prixNuit) * 100) / 100;
    const label = jourKm > 0.01 && nuitKm > 0.01 ? "Tarif mixte 🌗" : nuitKm > 0.01 ? "Tarif nuit 🌙" : "Tarif jour ☀️";
    return {
      distanceKm: distKm,
      jourKm,
      nuitKm,
      prixJour,
      prixNuit,
      priseEnCharge: TARIFS.PRISE_EN_CHARGE,
      total,
      label,
    };
  };

  const handleManualCompute = () => {
    const d = parseFloat(distanceKm.replace(",", "."));
    if (!d || d <= 0) {
      toast.error("Distance invalide");
      return;
    }
    // Durée masquée : on estime 2 min par km pour le calcul mixte jour/nuit.
    const t = Math.max(Math.round(d * 2), 1);
    setResult(computeBreakdown(d, t, pickupLocal));
  };

  const handleAdressesCompute = async () => {
    if (!depart.trim() || !arrivee.trim()) {
      toast.error("Renseigne le départ et la destination");
      return;
    }
    setLoadingRoute(true);
    setRouteError(null);
    try {
      const mapsApi = await loadGoogleMapsWhenVisible(mapRef.current!);
      const [geoA, geoB] = await Promise.all([
        geocodeAddress(normalizeAddress(depart)),
        geocodeAddress(normalizeAddress(arrivee)),
      ]);
      if (!geoA || !geoB) {
        setRouteError("Adresse introuvable");
        setLoadingRoute(false);
        return;
      }
      const svc = new mapsApi.maps.DirectionsService();
      const res: any = await new Promise((resolve, reject) =>
        svc.route(
          {
            origin: { lat: geoA.lat, lng: geoA.lng },
            destination: { lat: geoB.lat, lng: geoB.lng },
            travelMode: mapsApi.maps.TravelMode.DRIVING,
          },
          (r: any, s: any) => (s === "OK" && r ? resolve(r) : reject(s)),
        ),
      );
      const leg = res.routes[0].legs[0];
      // Arrondi à 1 décimale AVANT le calcul du prix, pour que l'affichage
      // ("5.2 km × 2.16 €") corresponde exactement au prix calculé et évite
      // toute impression d'erreur de calcul (ex: 5.153 km affiché "5.2" mais
      // facturé sur la valeur brute → 11.13 € au lieu de 11.23 € attendu).
      const distKm = Math.round(((leg.distance?.value ?? 0) / 1000) * 10) / 10;
      const stepMinutes = Math.max(Math.round((leg.duration?.value ?? distKm * 120) / 60), 1);
      setResult(computeBreakdown(distKm, stepMinutes, pickupLocal));
    } catch (e) {
      console.error("[SimulateurTab] route:", e);
      setRouteError("Impossible de calculer l'itinéraire — vérifie les adresses.");
    } finally {
      setLoadingRoute(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    fontSize: 16,
    fontFamily: "'DM Sans', sans-serif",
    color: "#0f172a",
    background: "#FDFBF7",
    colorScheme: "light",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
    display: "block",
    marginBottom: 6,
  };

  return (
    <>
      <p className="drv-section">Simulateur de tarif</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button
          onClick={() => setMode("manuel")}
          style={{
            flex: 1,
            padding: "10px",
            minHeight: 44,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            border: mode === "manuel" ? "2px solid #2563eb" : "1px solid #e2e8f0",
            background: mode === "manuel" ? "#eff6ff" : "#FDFBF7",
            color: mode === "manuel" ? "#1d4ed8" : "#475569",
          }}
        >
          🧮 Km
        </button>
        <button
          onClick={() => setMode("adresses")}
          style={{
            flex: 1,
            padding: "10px",
            minHeight: 44,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            border: mode === "adresses" ? "2px solid #2563eb" : "1px solid #e2e8f0",
            background: mode === "adresses" ? "#eff6ff" : "#FDFBF7",
            color: mode === "adresses" ? "#1d4ed8" : "#475569",
          }}
        >
          📍 Adresses
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>📅 Heure de prise en charge</label>
        <input
          type="datetime-local"
          value={pickupLocal}
          onChange={(e) => setPickupLocal(e.target.value)}
          style={inputStyle}
        />
      </div>

      {mode === "manuel" ? (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>🛣 Distance (km)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ex: 15.6"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button
            onClick={handleManualCompute}
            style={{
              width: "100%",
              background: "#0b1224",
              color: "#FDFBF7",
              border: "none",
              borderRadius: 12,
              padding: "13px",
              minHeight: 46,
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            💶 Calculer le prix
          </button>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>📍 Départ</label>
            <input
              type="text"
              placeholder="Ex: 37 Rue Charles Domercq, Bordeaux"
              value={depart}
              onChange={(e) => setDepart(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>🏁 Destination</label>
            <input
              type="text"
              placeholder="Ex: Aéroport Bordeaux-Mérignac"
              value={arrivee}
              onChange={(e) => setArrivee(e.target.value)}
              style={inputStyle}
            />
          </div>
          {/* Élément requis (même caché) pour déclencher le chargement de Google Maps */}
          <div ref={mapRef} style={{ height: 1, overflow: "hidden" }} />
          <button
            onClick={handleAdressesCompute}
            disabled={loadingRoute}
            style={{
              width: "100%",
              background: "#0b1224",
              color: "#FDFBF7",
              border: "none",
              borderRadius: 12,
              padding: "13px",
              minHeight: 46,
              fontSize: 14,
              fontWeight: 800,
              cursor: loadingRoute ? "default" : "pointer",
              marginBottom: 14,
              opacity: loadingRoute ? 0.7 : 1,
            }}
          >
            {loadingRoute ? "…" : "🗺 Calculer l'itinéraire et le prix"}
          </button>
          {routeError && <div style={{ color: "#b91c1c", fontSize: 13, marginBottom: 12 }}>{routeError}</div>}
        </>
      )}

      {result && (
        <div
          style={{
            border: "2px solid #0b1224",
            borderRadius: 14,
            padding: 16,
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 13, color: "#64748b" }}>🛣 {result.distanceKm.toFixed(1)} km</span>

            <span
              className="drv-badge-pill"
              style={{
                background: result.label.includes("mixte")
                  ? "#fdf4ff"
                  : result.label.includes("nuit")
                    ? "#eff6ff"
                    : "#f0fdf4",
                color: result.label.includes("mixte")
                  ? "#a21caf"
                  : result.label.includes("nuit")
                    ? "#1d4ed8"
                    : "#15803d",
              }}
            >
              {result.label}
            </span>
          </div>

          <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.9 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Prise en charge</span>
              <span>{result.priseEnCharge.toFixed(2)} €</span>
            </div>
            {result.jourKm > 0.01 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  Tarif jour ☀️ · {result.jourKm.toFixed(1)} km × {TARIFS.TARIF_JOUR.toFixed(2)} €
                </span>
                <span>{result.prixJour.toFixed(2)} €</span>
              </div>
            )}
            {result.nuitKm > 0.01 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  Tarif nuit 🌙 · {result.nuitKm.toFixed(1)} km × {TARIFS.TARIF_NUIT.toFixed(2)} €
                </span>
                <span>{result.prixNuit.toFixed(2)} €</span>
              </div>
            )}
          </div>

          <hr className="drv-divider" style={{ margin: "10px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#0b1224" }}>Total estimé</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#0b1224" }}>{result.total.toFixed(2)} €</span>
          </div>
        </div>
      )}
    </>
  );
}

const DRIVER_LABEL: Record<string, string> = {
  patricia: "Patricia",
  alain: "Alain",
  non_attribuee: "Non attribuée",
};

export function StatsTab() {
  const getStats = useServerFn(getDriverStats);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const load = useCallback(async () => {
    try {
      if (!getDriverToken()) {
        return;
      }
      const res = await getStats({ data: { token: getDriverToken(), days } });
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [getStats, days]);

  useEffect(() => {
    setLoading(true);
    load();
    const t = setInterval(load, 8000);
    const ch = (supabase as any)
      .channel("driver-feed", { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "reservation" }, () => load())
      .subscribe();
    const onVis = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      supabase.removeChannel(ch);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  if (loading)
    return (
      <div className="drv-empty">
        <div style={{ fontSize: 14 }}>Chargement…</div>
      </div>
    );

  if (!data)
    return (
      <div className="drv-empty">
        <div style={{ fontSize: 14 }}>Statistiques indisponibles</div>
      </div>
    );

  const maxDay = Math.max(1, ...data.byDay.map((d: any) => d.count));
  const fmtMin = (v: number | null) => (v == null ? "—" : v >= 60 ? `${Math.round(v / 6) / 10} h` : `${v} min`);

  return (
    <>
      <div style={{ display: "flex", gap: 6, padding: "10px 0 2px", overflowX: "auto" }}>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            style={{
              padding: "7px 14px",
              borderRadius: 999,
              border: "1px solid " + (days === d ? "var(--background)" : "var(--border)"),
              background: days === d ? "var(--background)" : "#FDFBF7",
              color: days === d ? "var(--gold)" : "#334155",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 36,
            }}
          >
            {d} jours
          </button>
        ))}
        <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: 11, color: "#94a3b8" }}>⏱ temps réel</span>
      </div>

      <p className="drv-section">Vue d'ensemble</p>
      <div className="drv-stat-grid">
        <div className="drv-stat">
          <div className="drv-stat-lbl">Demandes</div>
          <div className="drv-stat-val">{data.global.total}</div>
          <div className="drv-stat-sub">{days} derniers jours</div>
        </div>
        <div className="drv-stat">
          <div className="drv-stat-lbl">Courses terminées</div>
          <div className="drv-stat-val">{data.global.completed}</div>
          <div className="drv-stat-sub">{data.global.km} km</div>
        </div>
        <div className="drv-stat">
          <div className="drv-stat-lbl">Revenus</div>
          <div className="drv-stat-val">{data.global.revenue} €</div>
          <div className="drv-stat-sub">courses terminées</div>
        </div>
        <div className="drv-stat">
          <div className="drv-stat-lbl">Note moyenne</div>
          <div className="drv-stat-val">{data.note > 0 ? data.note : "—"}</div>
          <div className="drv-stat-sub" style={{ color: "#f59e0b" }}>
            {data.note > 0 ? "★ sur 5" : "Pas encore d'avis"}
          </div>
        </div>
      </div>

      <p className="drv-section">Par chauffeur</p>
      {data.drivers
        .filter((d: any) => d.total > 0 || d.driver !== "non_attribuee")
        .map((d: any) => (
          <div className="drv-card" key={d.driver} style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: d.driver === "patricia" ? "#fdf2f8" : d.driver === "alain" ? "#eff6ff" : "#f1f5f9",
                  color: d.driver === "patricia" ? "#9d174d" : d.driver === "alain" ? "#1d4ed8" : "#475569",
                }}
              >
                👤 {DRIVER_LABEL[d.driver]}
              </span>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{d.total} demande(s)</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {[
                { l: "Taux d'acceptation", v: `${d.acceptanceRate}%` },
                { l: "Terminées", v: String(d.completed) },
                { l: "Délai d'acceptation", v: fmtMin(d.avgAcceptMinutes) },
                { l: "Durée moyenne course", v: fmtMin(d.avgTripMinutes) },
                { l: "En attente", v: String(d.pending) },
                { l: "Revenus", v: `${d.revenue} €` },
              ].map((c) => (
                <div key={c.l} style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 10px" }}>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "#64748b",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {c.l}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{c.v}</div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 8,
                height: 6,
                background: "#e2e8f0",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div style={{ width: `${d.acceptanceRate}%`, height: "100%", background: "#16a34a" }} />
            </div>
          </div>
        ))}

      <p className="drv-section">7 derniers jours</p>
      <div className="drv-card">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70, marginBottom: 6 }}>
          {data.byDay.map((d: any) => (
            <div
              key={d.date}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ textAlign: "center", fontSize: 10.5, color: "#0f172a", fontWeight: 700 }}>{d.count}</div>
              <div
                style={{
                  width: "100%",
                  borderRadius: "4px 4px 0 0",
                  background: "#0f172a",
                  height: `${Math.max(6, (d.count / maxDay) * 52)}px`,
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {data.byDay.map((d: any) => (
            <div key={d.date} style={{ flex: 1, textAlign: "center", fontSize: 10.5, color: "#94a3b8" }}>
              {new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3)}
            </div>
          ))}
        </div>
      </div>

      {/* Visiteurs actifs */}
      <p className="drv-section">En ce moment</p>
      <ActiveVisitors />

      {/* Analytics suivi */}
      <TrackingAnalytics />
    </>
  );
}

// ── Onglet Historique : demandes, attributions et statuts horodatés ────────
export function HistoriqueTab({ driverId }: { driverId?: string }) {
  const listEvents = useServerFn(listReservationEvents);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "patricia" | "alain">(
    driverId === "patricia" || driverId === "alain" ? (driverId as any) : "all",
  );

  const load = useCallback(async () => {
    try {
      if (!getDriverToken()) {
        return;
      }
      const res = await listEvents({
        data: { token: getDriverToken(), limit: 120, driver: filter },
      });
      setRows((res as any)?.events ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [listEvents, filter]);

  useEffect(() => {
    setLoading(true);
    load();
    const t = setInterval(load, 8000);
    const ch = (supabase as any)
      .channel("driver-feed", { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "reservation" }, () => load())
      .subscribe();
    const onVis = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
      supabase.removeChannel(ch);
    };
  }, [load]);

  const eventLabel = (e: any) => {
    if (e.event_type === "created") return "🆕 Nouvelle demande";
    if (e.event_type === "assigned")
      return `↔ Attribuée à ${DRIVER_LABEL[e.to_value] ?? e.to_value ?? "—"}${e.from_value ? ` (avant : ${DRIVER_LABEL[e.from_value] ?? e.from_value})` : ""}`;
    const map: Record<string, string> = {
      accepted: "✅ Acceptée",
      en_route: "🚖 En route",
      arrived: "📍 Prise en charge",
      completed: "🏁 Terminée",
      terminee: "🏁 Terminée",
      cancelled: "✖ Annulée / refusée",
    };
    return map[e.to_value] ?? `Statut : ${e.to_value}`;
  };

  return (
    <>
      <div style={{ display: "flex", gap: 6, padding: "10px 0 2px" }}>
        {(
          [
            { k: "all", l: "Tout" },
            { k: "patricia", l: "Patricia" },
            { k: "alain", l: "Alain" },
          ] as const
        ).map((o) => (
          <button
            key={o.k}
            onClick={() => setFilter(o.k as any)}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid " + (filter === o.k ? "var(--background)" : "var(--border)"),
              background: filter === o.k ? "var(--background)" : "#FDFBF7",
              color: filter === o.k ? "var(--gold)" : "#334155",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 38,
            }}
          >
            {o.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="drv-empty">
          <div style={{ fontSize: 14 }}>Chargement…</div>
        </div>
      ) : rows.length === 0 ? (
        <div className="drv-empty">
          <div style={{ fontSize: 14 }}>Aucun évènement pour le moment</div>
        </div>
      ) : (
        <div className="drv-card">
          {rows.map((e) => (
            <div key={e.id} style={{ padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{eventLabel(e)}</span>
                <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
                  {new Date(e.created_at).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                {e.client_name ? `${e.client_name} · ` : ""}
                {e.depart ?? "—"} → {e.destination ?? "—"}
              </div>
              {e.driver && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: e.driver === "patricia" ? "#fdf2f8" : "#eff6ff",
                    color: e.driver === "patricia" ? "#9d174d" : "#1d4ed8",
                  }}
                >
                  👤 {DRIVER_LABEL[e.driver] ?? e.driver}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Onglet Appareils (notifications push par chauffeur) ────────────────────
const DRIVER_LABELS: Record<string, string> = {
  patricia: "Patricia",
  alain: "Alain",
  admin: "Administration",
};

function fmtDate(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AppareilsTab() {
  const listFn = useServerFn(listDriverDevices);
  const revokeFn = useServerFn(revokeDriverDevice);
  const logFn = useServerFn(driverPushLog);

  const [devices, setDevices] = useState<any[]>([]);
  const [log, setLog] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, sent: 0, failed: 0, email: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [perm, setPerm] = useState<string>("default");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getDriverToken();
      const [d, l]: any[] = await Promise.all([listFn({ data: { token } }), logFn({ data: { token, limit: 60 } })]);
      setDevices(d?.devices ?? []);
      setLog(l?.entries ?? []);
      setStats(l?.stats ?? { total: 0, sent: 0, failed: 0, email: 0 });
    } catch (e: any) {
      toast.error("Chargement des appareils impossible");
    } finally {
      setLoading(false);
    }
  }, [listFn, logFn]);

  useEffect(() => {
    load();
    if (typeof window !== "undefined" && "Notification" in window) setPerm(Notification.permission);
  }, [load]);

  const revoke = async (id: string, label: string) => {
    if (!window.confirm(`Désinscrire l'appareil « ${label} » des notifications ?`)) return;
    setBusy(id);
    try {
      await revokeFn({ data: { token: getDriverToken(), device_id: id } });
      toast.success("Appareil désinscrit");
      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast.error("Révocation impossible");
    } finally {
      setBusy(null);
    }
  };

  const groups = React.useMemo(() => {
    const map = new Map<string, any[]>();
    for (const d of devices) {
      const key = d.driver_id || "inconnu";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [devices]);

  if (loading) return <div style={{ padding: 16, color: "#64748b" }}>Chargement…</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>
          Permission navigateur :{" "}
          <b>{perm === "granted" ? "accordée" : perm === "denied" ? "refusée" : "non demandée"}</b>
        </span>
        <button
          onClick={load}
          style={{
            marginLeft: "auto",
            background: "#0f172a",
            color: "#FDFBF7",
            border: "none",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🔄 Rafraîchir
        </button>
      </div>

      {groups.length === 0 && (
        <div style={{ color: "#64748b", fontSize: 14 }}>Aucun appareil inscrit pour le moment.</div>
      )}

      {groups.map(([driver, list]) => (
        <div key={driver} style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
          <div
            style={{
              background: "var(--background)",
              color: "var(--gold)",
              padding: "10px 14px",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {DRIVER_LABELS[driver] ?? "Chauffeur inconnu"} — {list.length} appareil
            {list.length > 1 ? "s" : ""}
          </div>
          <div style={{ display: "grid" }}>
            {list.map((d) => (
              <div key={d.id} style={{ padding: 12, borderTop: "1px solid #f1f5f9", display: "grid", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <b style={{ fontSize: 14 }}>{d.platform}</b>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: d.active ? "#dcfce7" : "#fee2e2",
                      color: d.active ? "#166534" : "#991b1b",
                    }}
                  >
                    {d.active ? "actif" : "inactif"}
                  </span>
                  <code style={{ fontSize: 11, color: "#64748b" }}>…{d.fcm_suffix ?? "—"}</code>
                  <button
                    onClick={() => revoke(d.id, `${DRIVER_LABELS[driver] ?? driver} · ${d.platform}`)}
                    disabled={busy === d.id}
                    style={{
                      marginLeft: "auto",
                      background: "#dc2626",
                      color: "#FDFBF7",
                      border: "none",
                      borderRadius: 8,
                      padding: "5px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {busy === d.id ? "…" : "Désinscrire"}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: "#475569" }}>
                  Dernière activité : {fmtDate(d.last_seen_at)} · Inscrit le {fmtDate(d.created_at)}
                </div>
                <div style={{ fontSize: 12, color: "#475569" }}>
                  Dernier envoi : {fmtDate(d.last_sent_at)}
                  {d.last_sent_title ? ` — ${d.last_sent_title}` : ""}
                </div>
                <div style={{ fontSize: 12, color: d.last_error_at ? "#b91c1c" : "#94a3b8" }}>
                  Dernière erreur :{" "}
                  {d.last_error_at
                    ? `${fmtDate(d.last_error_at)} — ${d.last_error_code ?? "erreur"}${d.last_error_status ? ` (HTTP ${d.last_error_status})` : ""}`
                    : "aucune"}
                </div>
                {d.user_agent && (
                  <div style={{ fontSize: 11, color: "#94a3b8", wordBreak: "break-all" }}>{d.user_agent}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: "#f8fafc", padding: "10px 14px", fontWeight: 800, fontSize: 14 }}>
          Journal des notifications — {stats.sent} envoyées · {stats.failed} en échec · {stats.email} repli e-mail
        </div>
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {log.length === 0 && (
            <div style={{ padding: 12, color: "#64748b", fontSize: 13 }}>Aucun envoi enregistré.</div>
          )}
          {log.map((e) => (
            <div
              key={e.id}
              style={{
                padding: "8px 12px",
                borderTop: "1px solid #f1f5f9",
                fontSize: 12,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "#94a3b8", minWidth: 96 }}>{fmtDate(e.created_at)}</span>
              <span
                style={{
                  fontWeight: 700,
                  color: e.status === "sent" ? "#166534" : e.status === "fallback_email" ? "#92400e" : "#b91c1c",
                }}
              >
                {e.status}
              </span>
              <span style={{ color: "#475569" }}>{e.audience}</span>
              <span style={{ color: "#0f172a", flex: 1, minWidth: 140 }}>{e.title ?? e.tag ?? "—"}</span>
              {e.error_code && <span style={{ color: "#b91c1c" }}>{e.error_code}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
