// Pages plein écran du tableau de bord chauffeur : stats, planning, sauvegardes.
import type React from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  driverBackupNow,
  driverBackups,
  driverStatsCompare,
  driverUnavailAdd,
  driverUnavailDelete,
  driverUnavailList,
} from "@/lib/driver-ops.functions";
import { cachedDriverProfiles, getProfile } from "@/lib/driverProfile";

// embedded : page intégrée dans une page fusionnée (pas d'en-tête ni de plein écran propres).
type P = {
  token: string;
  onClose: () => void;
  embedded?: boolean | undefined;
};
const card: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  background: "rgba(255,255,255,.04)",
  border: "1px solid rgba(255,255,255,.08)",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.12)",
  color: "inherit",
};
const eur = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" }) : "—";
const COLORS = ["#c99b4a", "#38bdf8", "#a78bfa", "#34d399"];

function Shell({
  title,
  onClose,
  embedded = false,
  children,
}: {
  title: string;
  onClose: () => void;
  embedded?: boolean | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className={embedded ? undefined : "drv-rides-page"}>
      {embedded ? null : (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <button type="button" className="drv-rides-btn" onClick={onClose}>
            ← Retour
          </button>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}

export function StatsPage({ token, onClose, embedded }: P) {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const { data, isLoading } = useQuery({
    queryKey: ["driver-stats-compare", token, period],
    queryFn: () => driverStatsCompare({ data: { token, period } }),
  });
  const stats = data?.stats ?? [];
  const slugs = stats.map((s) => s.slug);
  const max = Math.max(1, ...(data?.weeks ?? []).flatMap((w) => Object.values(w.bySlug)));
  return (
    <Shell title="Stats Adam / Ayoub" onClose={onClose} embedded={embedded}>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {(["week", "month", "year"] as const).map((p) => (
          <button
            key={p}
            type="button"
            className="drv-rides-btn"
            onClick={() => setPeriod(p)}
            style={{ opacity: period === p ? 1 : 0.55 }}
          >
            {p === "week" ? "7 jours" : p === "month" ? "30 jours" : "12 mois"}
          </button>
        ))}
      </div>
      {isLoading ? <p style={{ opacity: 0.7 }}>Chargement…</p> : null}
      {!isLoading && stats.length === 0 ? <p style={{ opacity: 0.7 }}>Aucune course terminée sur la période.</p> : null}
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
        {stats.map((s, i) => (
          <div key={s.slug} style={{ ...card, borderColor: COLORS[i % 4] }}>
            <div style={{ fontWeight: 600, color: COLORS[i % 4] }}>{s.name}</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{eur(s.revenue)}</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              {s.rides} course(s) · {s.km} km · panier moyen {eur(s.avg)}
            </div>
          </div>
        ))}
      </div>
      {(data?.weeks ?? []).length > 0 ? (
        <div style={{ ...card, marginTop: 14 }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Chiffre d'affaires par semaine (8 dernières)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160 }}>
            {data!.weeks.map((w) => (
              <div
                key={w.week}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
              >
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 130 }}>
                  {slugs.map((sl, i) => (
                    <div
                      key={sl}
                      title={`${sl} : ${eur(w.bySlug[sl] ?? 0)}`}
                      style={{
                        width: 10,
                        height: `${((w.bySlug[sl] ?? 0) / max) * 130}px`,
                        background: COLORS[i % 4],
                        borderRadius: 3,
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 10, opacity: 0.6 }}>
                  {w.week.slice(8, 10)}/{w.week.slice(5, 7)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Shell>
  );
}

export function PlanningPage({ token, onClose, embedded }: P) {
  const qc = useQueryClient();
  const profiles = cachedDriverProfiles();
  const today = new Date().toISOString().slice(0, 10);
  const [slug, setSlug] = useState(getProfile() ?? profiles[0]?.slug ?? "");
  const [start, setStart] = useState(`${today}T00:00`);
  const [end, setEnd] = useState(`${today}T23:59`);
  const [reason, setReason] = useState("");
  const q = useQuery({ queryKey: ["driver-unavail", token], queryFn: () => driverUnavailList({ data: { token } }) });
  const refresh = () => qc.invalidateQueries({ queryKey: ["driver-unavail", token] });
  const add = useMutation({
    mutationFn: () =>
      driverUnavailAdd({
        data: {
          token,
          driver_slug: slug,
          starts_at: new Date(start).toISOString(),
          ends_at: new Date(end).toISOString(),
          reason: reason || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Absence ajoutée");
      setReason("");
      refresh();
    },
    onError: () => toast.error("Vérifiez les dates (la fin doit être après le début)"),
  });
  const del = useMutation({
    mutationFn: (id: string) => driverUnavailDelete({ data: { token, id } }),
    onSuccess: refresh,
  });
  const name = (s: string) => profiles.find((p) => p.slug === s)?.name ?? s;
  return (
    <Shell title="Planning absences" onClose={onClose} embedded={embedded}>
      <div style={{ ...card, display: "grid", gap: 8 }}>
        <label style={{ fontSize: 12, opacity: 0.7 }}>Chauffeur</label>
        <select value={slug} onChange={(e) => setSlug(e.target.value)} style={inputStyle}>
          {profiles.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
        <label style={{ fontSize: 12, opacity: 0.7 }}>Début</label>
        <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} style={inputStyle} />
        <label style={{ fontSize: 12, opacity: 0.7 }}>Fin</label>
        <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} style={inputStyle} />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motif (congé, rendez-vous…)"
          maxLength={200}
          style={inputStyle}
        />
        <button type="button" className="drv-rides-btn" disabled={add.isPending || !slug} onClick={() => add.mutate()}>
          Ajouter l'absence
        </button>
      </div>
      <p style={{ fontSize: 12, opacity: 0.65, marginTop: 8 }}>
        Un chauffeur absent ne peut pas être choisi dans la fenêtre d'acceptation d'une course.
      </p>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {(q.data?.rows ?? []).map((r) => (
          <div
            key={r.id}
            style={{ ...card, display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>
                {name(r.driver_slug)}
                {q.data?.absentNow.includes(r.driver_slug) ? (
                  <span style={{ color: "#f87171" }}> · absent maintenant</span>
                ) : null}
              </div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                {fmt(r.starts_at)} → {fmt(r.ends_at)}
                {r.reason ? ` · ${r.reason}` : ""}
              </div>
            </div>
            <button type="button" className="drv-rides-btn" onClick={() => del.mutate(r.id)}>
              Supprimer
            </button>
          </div>
        ))}
        {q.data && q.data.rows.length === 0 ? <p style={{ opacity: 0.7 }}>Aucune absence prévue.</p> : null}
      </div>
    </Shell>
  );
}

export function BackupsPage({ token, onClose, embedded }: P) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["driver-backups", token], queryFn: () => driverBackups({ data: { token } }) });
  const now = useMutation({
    mutationFn: () => driverBackupNow({ data: { token } }),
    onSuccess: (r) => {
      toast.success(`Sauvegarde faite (${r.rows} lignes)`);
      qc.invalidateQueries({ queryKey: ["driver-backups", token] });
    },
    onError: () => toast.error("Sauvegarde impossible"),
  });
  return (
    <Shell title="Sauvegardes" onClose={onClose} embedded={embedded}>
      <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 10 }}>
        Copie des réservations, clients, comptabilité et avis. Les 8 dernières sont conservées.
      </p>
      <button type="button" className="drv-rides-btn" disabled={now.isPending} onClick={() => now.mutate()}>
        {now.isPending ? "Sauvegarde…" : "Sauvegarder maintenant"}
      </button>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {(q.data?.files ?? []).map((f) => (
          <div
            key={f.name}
            style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{fmt(f.created_at)}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{Math.round(f.size / 1024)} Ko</div>
            </div>
            {f.url ? (
              <a className="drv-rides-btn" href={f.url} download={f.name}>
                Télécharger
              </a>
            ) : null}
          </div>
        ))}
        {q.data && q.data.files.length === 0 ? <p style={{ opacity: 0.7 }}>Aucune sauvegarde pour l'instant.</p> : null}
      </div>
    </Shell>
  );
}
