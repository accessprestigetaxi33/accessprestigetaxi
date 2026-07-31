import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  adminFixReservation,
  adminOverview,
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

  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<"chauffeurs" | "courses" | "journal">("chauffeurs");
  const [query, setQuery] = useState("");

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
        {(["chauffeurs", "courses", "journal"] as const).map((t) => (
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
            {t === "chauffeurs" ? "Chauffeurs & rotation" : t === "courses" ? "Correction statuts" : "Journal"}
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
            <div style={{ display: "grid", gap: 10 }}>
              {filtered.length === 0 && <div style={{ color: "#64748b", fontSize: 14 }}>Aucune course.</div>}
              {filtered.map((r: any) => (
                <div key={r.id} style={{ border: "1px solid #eceef1", borderRadius: 12, padding: 12 }}>
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
              ))}
            </div>
          </section>
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
      </main>
    </div>
  );
}
