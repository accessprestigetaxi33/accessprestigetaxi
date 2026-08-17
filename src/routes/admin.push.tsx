// Page d'administration des notifications push chauffeur.
// Accès protégé par le jeton du panneau chauffeur (localStorage "driver_token").
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  listPushSubscriptions,
  listPushFailures,
  listPushSends,
  forceResubscribe,
  sendChauffeurTestPush,
  type PushSubRow,
} from "@/lib/push-admin.functions";
import { getDriverToken, setDriverToken } from "@/lib/driver-token";

export const Route = createFileRoute("/admin/push")({
  head: () => ({
    meta: [
      { title: "Admin notifications push — Access Prestige Taxi" },
      {
        name: "description",
        content:
          "Console interne Access Prestige Taxi : abonnements push des chauffeurs, échecs d'envoi FCM et test de diffusion.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin notifications push — Access Prestige Taxi" },
      { property: "og:description", content: "Console interne de diagnostic des notifications chauffeur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Admin notifications push — Access Prestige Taxi" },
      { name: "twitter:description", content: "Console interne de diagnostic des notifications chauffeur." },
    ],
  }),
  component: AdminPushPage,
});

function AdminPushPage() {
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [subs, setSubs] = useState<PushSubRow[]>([]);
  const [byDriver, setByDriver] = useState<Record<string, number>>({});
  const [failures, setFailures] = useState<any[]>([]);
  const [sends, setSends] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listSubsFn = useServerFn(listPushSubscriptions);
  const listFailFn = useServerFn(listPushFailures);
  const listSendsFn = useServerFn(listPushSends);
  const forceFn = useServerFn(forceResubscribe);
  const testFn = useServerFn(sendChauffeurTestPush);

  useEffect(() => {
    setToken(getDriverToken());
  }, []);

  const load = useCallback(
    async (t: string) => {
      if (!t) return;
      setBusy(true);
      setError(null);
      try {
        const [s, f, l] = await Promise.all([
          listSubsFn({ data: { token: t, audience: "all" } }),
          listFailFn({ data: { token: t, audience: "all" } }),
          listSendsFn({ data: { token: t } }),
        ]);
        setSubs(s.subs);
        setByDriver(s.byDriver);
        setFailures(f.failures);
        setSends(l.sends);
      } catch {
        setError("Accès refusé — jeton chauffeur invalide.");
      } finally {
        setBusy(false);
      }
    },
    [listSubsFn, listFailFn, listSendsFn],
  );

  useEffect(() => {
    if (token) void load(token);
  }, [token, load]);

  if (!token) {
    return (
      <main style={wrap}>
        <h1 style={{ fontSize: 20, marginBottom: 12 }}>Admin — Notifications push</h1>
        <p style={{ fontSize: 13, marginBottom: 10 }}>
          Connectez-vous d'abord dans l'espace chauffeur, ou collez le code d'administration ci-dessous.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Code d'administration"
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #d6cbb2" }}
          />
          <button
            style={btn}
            onClick={() => {
              const t = input.trim();
              if (!t) return;
              setDriverToken(t);
              setToken(t);
            }}
          >
            Entrer
          </button>
        </div>
      </main>
    );
  }

  const chauffeurSubs = subs.filter((s) => s.audience === "chauffeur");
  const clientSubs = subs.filter((s) => s.audience !== "chauffeur");

  return (
    <main style={wrap}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Admin — Notifications push</h1>
      <p style={{ fontSize: 12.5, color: "#6b6152", marginBottom: 14 }}>
        Abonnements chauffeur par driver_id, échecs FCM et test de diffusion. <a href="/driver">← Espace chauffeur</a>
      </p>

      {error && <div style={{ color: "#b91c1c", marginBottom: 10 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button
          style={btn}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const r = await testFn({ data: { token, driverId: null } });
              toast.success(`Broadcast envoyé à ${r.sent} appareil(s).`);
              await load(token);
            } catch {
              toast.error("Envoi impossible.");
            } finally {
              setBusy(false);
            }
          }}
        >
          📢 Test broadcast (Alain + Patricia)
        </button>
        {(["alain", "patricia"] as const).map((d) => (
          <button
            key={d}
            style={{ ...btn, background: "#6b7280" }}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const r = await testFn({ data: { token, driverId: d } });
                toast.success(`Test ${d} : ${r.sent} appareil(s).`);
                await load(token);
              } catch {
                toast.error("Envoi impossible.");
              } finally {
                setBusy(false);
              }
            }}
          >
            🔔 Test {d}
          </button>
        ))}
        <button style={{ ...btn, background: "#334155" }} disabled={busy} onClick={() => void load(token)}>
          ↻ Rafraîchir
        </button>
      </div>

      <section style={section}>
        <h2 style={h2}>Chauffeurs ({chauffeurSubs.length} appareil(s))</h2>
        <p style={{ fontSize: 12.5, marginBottom: 8 }}>
          {Object.keys(byDriver).length === 0
            ? "Aucun appareil chauffeur enregistré."
            : Object.entries(byDriver)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" · ")}
        </p>
        {(["alain", "patricia"] as const)
          .filter((d) => !byDriver[d])
          .map((d) => (
            <div key={d} style={{ color: "#b91c1c", fontSize: 12.5 }}>
              ⚠️ {d} n'a aucun appareil enregistré — il ne recevra rien tant qu'il n'aura pas activé les notifications
              depuis son iPhone sur /driver.
            </div>
          ))}
        <Table
          rows={chauffeurSubs}
          onDelete={async (id) => {
            await forceFn({ data: { token, id } });
            toast.success("Abonnement supprimé — l'appareil se ré-inscrira automatiquement.");
            await load(token);
          }}
        />
      </section>

      <section style={section}>
        <h2 style={h2}>Clients ({clientSubs.length})</h2>
        <Table
          rows={clientSubs}
          onDelete={async (id) => {
            await forceFn({ data: { token, id } });
            await load(token);
          }}
        />
      </section>

      <section style={section}>
        <h2 style={h2}>Derniers échecs d'envoi</h2>
        {failures.length === 0 ? (
          <p style={{ fontSize: 12.5 }}>Aucun échec récent.</p>
        ) : (
          <ul style={{ fontSize: 12.5, paddingLeft: 18 }}>
            {failures.map((f) => (
              <li key={f.id}>
                {new Date(f.created_at).toLocaleString("fr-FR")} · {f.audience} · {f.status} · HTTP{" "}
                {f.http_status ?? "—"} · {f.error_code ?? "—"} · …{f.fcm_token_suffix ?? "—"}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={section}>
        <h2 style={h2}>Derniers envois</h2>
        <ul style={{ fontSize: 12.5, paddingLeft: 18 }}>
          {sends.map((s) => (
            <li key={s.id}>
              {new Date(s.created_at).toLocaleString("fr-FR")} · {s.audience} · {s.status} · {s.title ?? ""}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Table({ rows, onDelete }: { rows: PushSubRow[]; onDelete: (id: string) => Promise<void> }) {
  if (rows.length === 0) return <p style={{ fontSize: 12.5 }}>Aucun abonnement.</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e6ddc9" }}>
            <th style={td}>driver_id</th>
            <th style={td}>token</th>
            <th style={td}>dernier contact</th>
            <th style={td}>appareil</th>
            <th style={td}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderBottom: "1px solid #f0e9da" }}>
              <td style={td}>{r.driver_id ?? "—"}</td>
              <td style={td}>…{r.token_suffix}</td>
              <td style={td}>{r.last_seen_at ? new Date(r.last_seen_at).toLocaleString("fr-FR") : "—"}</td>
              <td style={{ ...td, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.user_agent ?? "—"}
              </td>
              <td style={td}>
                <button style={{ ...btn, background: "#b91c1c", padding: "4px 8px" }} onClick={() => void onDelete(r.id)}>
                  Forcer réinscription
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const wrap: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
  padding: "24px 16px 60px",
  background: "#FDFBF7",
  minHeight: "100vh",
  color: "#2b2418",
};
const section: React.CSSProperties = {
  border: "1px solid #e6ddc9",
  borderRadius: 12,
  padding: 12,
  marginBottom: 14,
  background: "#fff",
};
const h2: React.CSSProperties = { fontSize: 15, fontWeight: 700, marginBottom: 8 };
const td: React.CSSProperties = { padding: "6px 8px", verticalAlign: "top" };
const btn: React.CSSProperties = {
  background: "#0f172a",
  color: "#FDFBF7",
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
};
