import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  adminBatchFixReservations,
  adminFixReservation,
  adminOverview,
  adminPushLog,
  adminSetDriverActive,
  adminSetRotation,
  verifyAdminToken,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  validateSearch: (s: Record<string, unknown>) => ({ token: String(s.token ?? "") }),
  head: () => ({
    meta: [
      { title: "Administration — Access Prestige Taxi" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0B0B0D" },
    ],
  }),
  component: AdminPage,
});

const KEY = "admin_token";
const GOLD = "#C6A24A";
const INK = "#0B0B0D";

const STATUSES = ["pending", "accepted", "en_route", "arrived", "completed", "cancelled"] as const;
const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  en_route: "En route",
  arrived: "Sur place",
  completed: "Terminée",
  cancelled: "Annulée",
};

type Overview = Awaited<ReturnType<typeof adminOverview>>;

function fmt(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function AdminPage() {
  const { token: urlToken } = Route.useSearch();
  const verify = useServerFn(verifyAdminToken);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"checking" | "denied" | "granted">("checking");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const tryToken = useCallback(
    async (candidate: string) => {
      if (!candidate) return false;
      try {
        const res = await verify({ data: { token: candidate } });
        if (res?.ok) {
          try {
            localStorage.setItem(KEY, candidate);
          } catch {
            /* ignore */
          }
          setToken(candidate);
          setStatus("granted");
          return true;
        }
      } catch {
        /* ignore */
      }
      return false;
    },
    [verify],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let stored = "";
      try {
        stored = localStorage.getItem(KEY) || "";
      } catch {
        /* ignore */
      }
      for (const c of [urlToken, stored].filter(Boolean) as string[]) {
        const ok = await tryToken(c);
        if (cancelled) return;
        if (ok) return;
      }
      if (!cancelled) setStatus("denied");
    })();
    return () => {
      cancelled = true;
    };
  }, [urlToken, tryToken]);

  if (status !== "granted") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: INK,
          color: "#fff",
          fontFamily: "DM Sans, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ width: "100%", maxWidth: 340, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Administration</h1>
          <p style={{ fontSize: 13, opacity: 0.65, marginBottom: 18 }}>
            {status === "checking" ? "Vérification…" : "Code d'administration requis"}
          </p>
          {status === "denied" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                const ok = await tryToken(input.trim());
                if (!ok) setError("Code invalide");
              }}
              style={{ display: "grid", gap: 10 }}
            >
              <input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Code d'administration"
                autoComplete="current-password"
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #333",
                  background: "#141416",
                  color: "#fff",
                  fontSize: 16,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: GOLD,
                  color: INK,
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                Entrer
              </button>
              {error && <div style={{ color: "#f87171", fontSize: 13 }}>{error}</div>}
            </form>
          )}
        </div>
      </div>
    );
  }

  return <AdminDashboard token={token} />;
}

function AdminDashboard({ token }: { token: string }) {
  const load = useServerFn(adminOverview);
  const setActive = useServerFn(adminSetDriverActive);
  const setRotation = useServerFn(adminSetRotation);
  const fixResa = useServerFn(adminFixReservation);
  const batchFixResa = useServerFn(adminBatchFixReservations);

  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<"chauffeurs" | "courses" | "journal" | "notifications">("chauffeurs");
  const loadPushLog = useServerFn(adminPushLog);
  const [pushLog, setPushLog] = useState<{ entries: any[]; stats: { total: number; sent: number; failed: number; email: number } } | null>(null);
  const [pushLogLoading, setPushLogLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [batchStatus, setBatchStatus] = useState<string>("");
  const [batchDriver, setBatchDriver] = useState<string>("");
  const [batchBusy, setBatchBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await load({ data: { token } });
      setData(res);
    } catch {
      setMsg("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [load, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const refreshPushLog = useCallback(async () => {
    setPushLogLoading(true);
    try {
      const res = await loadPushLog({ data: { token, limit: 150 } });
      setPushLog(res as any);
    } catch {
      setMsg("Journal notifications indisponible");
    } finally {
      setPushLogLoading(false);
    }
  }, [loadPushLog, token]);

  useEffect(() => {
    if (tab === "notifications") void refreshPushLog();
  }, [tab, refreshPushLog]);

  const filtered = useMemo(() => {
    const rows = data?.reservations ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r: any) =>
      [r.nom, r.client_name, r.telephone, r.depart, r.destination, r.arrivee, r.status, r.assigned_driver]
        .filter(Boolean)
        .some((v: string) => String(v).toLowerCase().includes(q)),
    );
  }, [data, query]);

  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((r: any) => selected[r.id]);

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = { ...prev };
        filtered.forEach((r: any) => delete next[r.id]);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = { ...prev };
        filtered.forEach((r: any) => {
          next[r.id] = true;
        });
        return next;
      });
    }
  };

  const clearSelection = () => setSelected({});

  const applyBatch = async () => {
    if (selectedIds.length === 0) return;
    if (!batchStatus && !batchDriver) {
      setMsg("Choisissez un statut ou un chauffeur à appliquer.");
      return;
    }
    setBatchBusy(true);
    setMsg(null);
    try {
      const patch: any = { token, reservation_ids: selectedIds };
      if (batchStatus) patch.status = batchStatus;
      if (batchDriver) patch.assigned_driver = batchDriver;
      const res = await batchFixResa({ data: patch });
      setMsg(`${res.updated} course(s) mise(s) à jour.`);
      clearSelection();
      setBatchStatus("");
      setBatchDriver("");
      await refresh();
    } catch (e: any) {
      setMsg("Action impossible.");
    } finally {
      setBatchBusy(false);
    }
  };

  const act = async (key: string, fn: () => Promise<unknown>, ok: string) => {
    setBusy(key);
    setMsg(null);
    try {
      await fn();
      setMsg(ok);
      await refresh();
    } catch (e: any) {
      const m = String(e?.message || e);
      setMsg(m.includes("AU_MOINS_UN") ? "Au moins un chauffeur doit rester actif." : "Action impossible.");
    } finally {
      setBusy(null);
    }
  };

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#f6f7f9", fontFamily: "DM Sans, sans-serif", color: "#0f172a" }}>
      <header
        style={{
          background: INK,
          color: "#fff",
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 800, letterSpacing: 0.5, color: GOLD }}>ADMINISTRATION</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Access Prestige Taxi — bi-chauffeur</div>
        </div>
        <button
          onClick={() => void refresh()}
          style={{ background: GOLD, color: INK, border: "none", borderRadius: 10, padding: "9px 14px", fontWeight: 700 }}
        >
          Actualiser
        </button>
      </header>

      <nav style={{ display: "flex", gap: 8, padding: 12, overflowX: "auto" }}>
        {(["chauffeurs", "courses", "journal", "notifications"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "9px 14px",
              borderRadius: 999,
              border: "1px solid " + (tab === t ? INK : "#d8dbe0"),
              background: tab === t ? INK : "#fff",
              color: tab === t ? GOLD : "#334155",
              fontWeight: 700,
              fontSize: 14,
              whiteSpace: "nowrap",
            }}
          >
            {t === "chauffeurs"
              ? "Chauffeurs & rotation"
              : t === "courses"
                ? "Correction statuts"
                : t === "journal"
                  ? "Journal"
                  : "Notifications"}
          </button>
        ))}
      </nav>

      {msg && (
        <div style={{ margin: "0 12px 10px", padding: "10px 12px", borderRadius: 10, background: "#fff7e6", border: "1px solid #f0d9a8", fontSize: 13 }}>
          {msg}
        </div>
      )}

      <main style={{ padding: 12, display: "grid", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
        {loading && <div style={card}>Chargement…</div>}

        {!loading && tab === "chauffeurs" && data && (
          <>
            <section style={card}>
              <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>Chauffeurs</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {data.drivers.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      border: "1px solid #eceef1",
                      borderRadius: 12,
                      padding: "12px 14px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{d.name}</div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{d.phone || "—"}</div>
                      <div style={{ fontSize: 12, color: d.active ? "#15803d" : "#b91c1c", fontWeight: 700 }}>
                        {d.active ? "Actif — reçoit des courses" : "Désactivé — ne reçoit plus de courses"}
                      </div>
                    </div>
                    <button
                      disabled={busy === d.id}
                      onClick={() =>
                        act(d.id, () => setActive({ data: { token, driver_id: d.id, active: !d.active } }), d.active ? "Chauffeur désactivé." : "Chauffeur activé.")
                      }
                      style={{
                        border: "none",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontWeight: 700,
                        minHeight: 44,
                        background: d.active ? "#fee2e2" : "#dcfce7",
                        color: d.active ? "#b91c1c" : "#15803d",
                      }}
                    >
                      {d.active ? "Désactiver" : "Activer"}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Rotation (alternance)</h2>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>
                Dernier chauffeur servi : <strong>{data.rotation.last_driver || "—"}</strong> ({fmt(data.rotation.updated_at)}).
                La prochaine course ira à l'autre chauffeur actif.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {data.drivers.map((d) => (
                  <button
                    key={d.id}
                    disabled={busy === "rot-" + d.id}
                    onClick={() => act("rot-" + d.id, () => setRotation({ data: { token, last_driver: d.id } }), "Rotation mise à jour.")}
                    style={{
                      border: "1px solid #d8dbe0",
                      background: data.rotation.last_driver === d.id ? INK : "#fff",
                      color: data.rotation.last_driver === d.id ? GOLD : "#334155",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontWeight: 700,
                      minHeight: 44,
                    }}
                  >
                    Marquer « {d.name} » comme dernier servi
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {!loading && tab === "courses" && data && (
          <section style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>Correction rapide des statuts</h2>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (client, téléphone, trajet, statut…)"
              style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid #d8dbe0", fontSize: 15, marginBottom: 12 }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155", cursor: filtered.length ? "pointer" : "default" }}>
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  disabled={filtered.length === 0}
                  onChange={toggleSelectAll}
                  style={{ width: 18, height: 18 }}
                />
                {allFilteredSelected ? "Tout désélectionner" : "Tout sélectionner"}
              </label>
              {selectedIds.length > 0 && (
                <span style={{ fontSize: 13, color: "#64748b" }}>· {selectedIds.length} sélectionnée(s)</span>
              )}
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {filtered.length === 0 && <div style={{ color: "#64748b", fontSize: 14 }}>Aucune course.</div>}
              {filtered.map((r: any) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    gap: 10,
                    border: "1px solid " + (selected[r.id] ? GOLD : "#eceef1"),
                    borderRadius: 12,
                    padding: 12,
                    background: selected[r.id] ? "#fffdf6" : "#fff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!selected[r.id]}
                    onChange={() => toggleSelect(r.id)}
                    style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {r.client_name || r.nom || "Client"} · {fmt(r.pickup_datetime)}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                      {r.depart} → {r.destination || r.arrivee}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <select
                        value={r.status}
                        onChange={(e) =>
                          act("st-" + r.id, () => fixResa({ data: { token, reservation_id: r.id, status: e.target.value as any } }), "Statut corrigé.")
                        }
                        style={{ padding: "9px 10px", borderRadius: 10, border: "1px solid #d8dbe0", fontSize: 14, minHeight: 42 }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                      <select
                        value={r.assigned_driver || ""}
                        onChange={(e) =>
                          act("dr-" + r.id, () => fixResa({ data: { token, reservation_id: r.id, assigned_driver: e.target.value } }), "Chauffeur réattribué.")
                        }
                        style={{ padding: "9px 10px", borderRadius: 10, border: "1px solid #d8dbe0", fontSize: 14, minHeight: 42 }}
                      >
                        <option value="">Non attribuée</option>
                        {data.drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedIds.length > 0 && tab === "courses" && (
          <div
            style={{
              position: "sticky",
              bottom: 12,
              zIndex: 10,
              background: INK,
              color: "#fff",
              borderRadius: 14,
              padding: 14,
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: GOLD, whiteSpace: "nowrap" }}>
              {selectedIds.length} sélectionnée(s)
            </div>
            <select
              value={batchStatus}
              onChange={(e) => setBatchStatus(e.target.value)}
              style={{ padding: "9px 10px", borderRadius: 10, border: "1px solid #333", background: "#141416", color: "#fff", fontSize: 14, minHeight: 42 }}
            >
              <option value="">Statut inchangé</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <select
              value={batchDriver}
              onChange={(e) => setBatchDriver(e.target.value)}
              style={{ padding: "9px 10px", borderRadius: 10, border: "1px solid #333", background: "#141416", color: "#fff", fontSize: 14, minHeight: 42 }}
            >
              <option value="">Chauffeur inchangé</option>
              {data?.drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button
              disabled={batchBusy}
              onClick={() => void applyBatch()}
              style={{ background: GOLD, color: INK, border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, minHeight: 42 }}
            >
              {batchBusy ? "Application…" : "Appliquer"}
            </button>
            <button
              disabled={batchBusy}
              onClick={clearSelection}
              style={{ background: "transparent", color: "#fff", border: "1px solid #444", borderRadius: 10, padding: "10px 16px", fontWeight: 700, minHeight: 42 }}
            >
              Effacer la sélection
            </button>
          </div>
        )}

        {!loading && tab === "journal" && data && (
          <section style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>Journal des événements</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {data.events.length === 0 && <div style={{ color: "#64748b", fontSize: 14 }}>Aucun événement.</div>}
              {data.events.map((e: any) => (
                <div key={e.id} style={{ borderLeft: "3px solid " + GOLD, paddingLeft: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {e.event_type === "created"
                      ? "Nouvelle course"
                      : e.event_type === "assigned"
                        ? "Attribution"
                        : "Changement de statut"}
                    {e.driver ? ` · ${e.driver}` : ""}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {fmt(e.created_at)} — {e.client_name || "Client"} · {e.depart} → {e.destination}
                    {e.from_value || e.to_value ? ` · ${e.from_value ?? "—"} → ${e.to_value ?? "—"}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "notifications" && (
          <section style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800 }}>Journal des notifications</h2>
              <button
                onClick={() => void refreshPushLog()}
                style={{ background: INK, color: GOLD, border: "none", borderRadius: 10, padding: "8px 12px", fontWeight: 700 }}
              >
                Actualiser
              </button>
            </div>

            {pushLog && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {[
                  ["Total", pushLog.stats.total],
                  ["Délivrés", pushLog.stats.sent],
                  ["Erreurs", pushLog.stats.failed],
                  ["Replis e-mail", pushLog.stats.email],
                ].map(([label, value]) => (
                  <div key={String(label)} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "8px 14px" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{value}</div>
                  </div>
                ))}
              </div>
            )}

            {pushLogLoading && <div style={{ color: "#64748b", fontSize: 14 }}>Chargement…</div>}
            {!pushLogLoading && pushLog?.entries.length === 0 && (
              <div style={{ color: "#64748b", fontSize: 14 }}>Aucun envoi enregistré pour l'instant.</div>
            )}

            <div style={{ display: "grid", gap: 8 }}>
              {pushLog?.entries.map((e: any) => {
                const color =
                  e.status === "sent" ? "#16a34a" : e.status === "fallback_email" ? "#2563eb" : e.status === "skipped" ? "#94a3b8" : "#dc2626";
                return (
                  <div key={e.id} style={{ borderLeft: `3px solid ${color}`, paddingLeft: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {e.channel === "email" ? "E-mail" : "Push"} · {e.audience} · {e.status}
                      {e.http_status ? ` (${e.http_status})` : ""}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {fmt(e.created_at)} — {e.title || "—"}
                      {e.recipient ? ` · ${e.recipient}` : ""}
                      {e.fcm_token_suffix ? ` · …${e.fcm_token_suffix}` : ""}
                      {e.error_code ? ` · ${e.error_code}` : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
