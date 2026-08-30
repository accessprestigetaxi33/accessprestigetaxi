// Panneau de diagnostic push affiché dans l'espace chauffeur :
// statut de la permission, driver_id détecté, abonnements enregistrés,
// derniers échecs FCM et bouton de test broadcast.
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  listPushFailures,
  listPushSubscriptions,
  sendChauffeurTestPush,
  forceResubscribe,
  type PushSubRow,
} from "@/lib/push-admin.functions";
import { getDriverToken } from "@/lib/driver-token";

const card: React.CSSProperties = {
  background: "#050a10",
  border: "1px solid rgba(201,155,74,.45)",
  borderRadius: 12,
  padding: 12,
  margin: "10px 0",
  fontSize: 12.5,
  color: "#e0b866",
};

export default function PushDiagnosticsCard({
  driverId,
  pushStatus,
  token,
}: {
  driverId?: string;
  pushStatus: string;
  token?: string;
}) {
  const [open, setOpen] = useState(false);
  const [subs, setSubs] = useState<PushSubRow[]>([]);
  const [byDriver, setByDriver] = useState<Record<string, number>>({});
  const [failures, setFailures] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const listSubsFn = useServerFn(listPushSubscriptions);
  const listFailFn = useServerFn(listPushFailures);
  const testFn = useServerFn(sendChauffeurTestPush);
  const forceFn = useServerFn(forceResubscribe);

  const authToken = token || getDriverToken();

  const load = useCallback(async () => {
    if (!authToken) return;
    try {
      const [s, f] = await Promise.all([
        listSubsFn({ data: { token: authToken, audience: "chauffeur" } }),
        listFailFn({ data: { token: authToken, audience: "chauffeur" } }),
      ]);
      setSubs(s.subs);
      setByDriver(s.byDriver);
      setFailures(f.failures);
    } catch (e) {
      console.warn("[push-diag] load failed", e);
    }
  }, [authToken, listSubsFn, listFailFn]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const mine = subs.filter((s) => s.driver_id === driverId);

  return (
    <div style={{ ...card, color: "#e0b866" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          font: "inherit",
          fontWeight: 700,
          cursor: "pointer",
          color: "#e0b866",
        }}
      >
        {open ? "▾" : "▸"} 🧪 Diagnostic notifications
      </button>

      {open && (
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          <div>
            <b>Statut permission :</b> {pushStatus} · <b>driver_id :</b> {driverId || "(non identifié)"}
          </div>
          <div>
            <b>Appareils enregistrés :</b>{" "}
            {Object.keys(byDriver).length === 0
              ? "aucun"
              : Object.entries(byDriver)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" · ")}
            {driverId && mine.length === 0 && (
              <div style={{ color: "#b91c1c", marginTop: 4 }}>
                ⚠️ Aucun appareil enregistré pour « {driverId} » — appuyez sur « Activer » dans le bandeau ci-dessus.
              </div>
            )}
          </div>

          {mine.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {mine.map((s) => (
                <li key={s.id} style={{ marginBottom: 4 }}>
                  …{s.token_suffix} · vu {s.last_seen_at ? new Date(s.last_seen_at).toLocaleString("fr-FR") : "—"}{" "}
                  <button
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await forceFn({ data: { token: authToken, id: s.id } });
                        toast.success("Abonnement supprimé — il sera recréé à la ré-activation.");
                        await load();
                      } catch {
                        toast.error("Suppression impossible.");
                      } finally {
                        setBusy(false);
                      }
                    }}
                    disabled={busy}
                    style={{ fontSize: 11, marginLeft: 6, cursor: "pointer" }}
                  >
                    réinitialiser
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div>
            <b>Derniers échecs FCM :</b>
            {failures.length === 0 ? (
              " aucun 🎉"
            ) : (
              <ul style={{ margin: "4px 0 0", paddingLeft: 16 }}>
                {failures.slice(0, 6).map((f) => (
                  <li key={f.id}>
                    {new Date(f.created_at).toLocaleString("fr-FR")} · {f.status} · HTTP {f.http_status ?? "—"} ·{" "}
                    {f.error_code ?? "—"} · …{f.fcm_token_suffix ?? "—"}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={async () => {
                setBusy(true);
                try {
                  const r = await testFn({ data: { token: authToken, driverId: null } });
                  toast.success(`Broadcast envoyé à ${r.sent} appareil(s).`);
                  await load();
                } catch {
                  toast.error("Envoi de test impossible.");
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy || !authToken}
              style={btn}
            >
              📢 Test broadcast (Alain + Patricia)
            </button>
            <button onClick={() => void load()} disabled={busy} style={{ ...btn, background: "#6b7280" }}>
              ↻ Rafraîchir
            </button>
            <a href="/admin/push" style={{ ...btn, background: "#0f172a", textDecoration: "none", display: "inline-block" }}>
              ⚙️ Page admin push
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

const btn: React.CSSProperties = {
  background: "#0f172a",
  color: "#FDFBF7",
  border: "none",
  borderRadius: 8,
  padding: "7px 12px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};
