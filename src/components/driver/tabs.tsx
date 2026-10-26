// Onglets additionnels de l'espace chauffeur (messages, clients, avis,
// statistiques, planning, historique, simulateur, GPS, appareils).
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamMap, haversineKm } from "@/components/driver/TeamMap";
import { PushDebug } from "@/components/PushDebug";

import { driverRides } from "@/lib/driver.functions";
import { getProfile } from "@/lib/driverProfile";
import { useReservationsRealtime } from "@/hooks/useReservationsRealtime";
import { quoteRide } from "@/lib/quote.functions";
import {
  driverAvisDelete,
  driverAvisList,
  driverAvisSetStatus,
  driverClientHistory,
  driverClients,
  driverDeviceDelete,
  driverPlanningMonth,
  driverDevices,
  driverGpsPush,
  driverGpsState,
  driverGpsStop,
  driverPushFailures,
  driverSendMessage,
  driverStats,
  driverTestPush,
  driverThreadMessages,
  driverThreads,
} from "@/lib/driver-extra.functions";
import type { PlanningRide } from "@/lib/driver-extra.functions";

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n || 0);
const dt = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });


const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Acceptée",
  in_progress: "En route",
  arrived: "Arrivé",
  completed: "Terminée",
  cancelled: "Annulée",
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="drv-card">
      <h2 className="drv-card-title">{title}</h2>
      {children}
    </section>
  );
}

/* ─────────────── Planning ─────────────── */

const DAY_HEADS = ["L", "M", "M", "J", "V", "S", "D"];
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function PlanningTab({ token }: { token: string }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string>(dayKey(today));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const { data, isLoading } = useQuery({
    queryKey: ["driver-planning", token, year, month],
    queryFn: () => driverPlanningMonth({ data: { as: getProfile(), token, year, month } }),
  });

  const byDay = useMemo(() => {
    const map = new Map<string, PlanningRide[]>();
    for (const r of data?.rides ?? []) {
      if (r.status === "cancelled") continue;
      const k = dayKey(new Date(r.pickup_datetime));
      map.set(k, [...(map.get(k) ?? []), r]);
    }
    return map;
  }, [data]);

  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const selectedList = byDay.get(selected) ?? [];
  const monthTotal = (data?.rides ?? [])
    .filter((r) => r.status !== "cancelled")
    .reduce((s, r) => s + Number(r.prix_estime ?? 0), 0);

  return (
    <div className="grid gap-4">
      <Card title={`Planning — ${monthLabel}`}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            ‹ Mois précédent
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const n = new Date();
              setCursor(new Date(n.getFullYear(), n.getMonth(), 1));
              setSelected(dayKey(n));
            }}
          >
            Aujourd’hui
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            Mois suivant ›
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase opacity-70">
          {DAY_HEADS.map((d, i) => (
            <div key={`${d}-${i}`}>{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={`e-${i}`} className="min-h-[54px] rounded-md opacity-0" />;
            const k = dayKey(d);
            const list = byDay.get(k) ?? [];
            const isToday = k === dayKey(today);
            const isSel = k === selected;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setSelected(k)}
                className={[
                  "min-h-[54px] rounded-md border p-1 text-left text-xs transition",
                  isSel ? "border-amber-400 bg-amber-400/15" : "border-white/10 hover:bg-white/5",
                  isToday && !isSel ? "border-amber-400/50" : "",
                ].join(" ")}
              >
                <span className="block font-semibold">{d.getDate()}</span>
                {list.length > 0 ? (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                    {list.length} course{list.length > 1 ? "s" : ""}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs opacity-70">
          {isLoading ? "Chargement…" : `Total estimé du mois : ${eur(monthTotal)}`}
        </p>
      </Card>

      <Card
        title={new Date(selected).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      >
        {selectedList.length === 0 ? (
          <p className="text-sm">Aucune course ce jour-là.</p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {selectedList.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-white/10 px-3 py-2"
              >
                <span>
                  <strong>
                    {new Date(r.pickup_datetime).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>{" "}
                  {r.nom ? `${r.nom} · ` : ""}
                  {r.depart} → {r.destination ?? r.arrivee}
                </span>
                <span className="whitespace-nowrap">
                  {STATUS_LABELS[r.status] ?? r.status} ·{" "}
                  {r.prix_estime ? eur(Number(r.prix_estime)) : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/* ─────────────── Historique ─────────────── */

export function HistoryTab({ token }: { token: string }) {
  const { data } = useQuery({
    queryKey: ["driver-rides", token],
    queryFn: () => driverRides({ data: { as: getProfile(), token } }),
  });
  const past = (data?.rides ?? [])
    .filter((r) => new Date(r.pickup_datetime) < new Date())
    .sort((a, b) => b.pickup_datetime.localeCompare(a.pickup_datetime));
  return (
    <Card title="Historique des courses">
      {past.length === 0 ? (
        <p className="text-sm">Aucune course passée sur les 7 derniers jours.</p>
      ) : (
        <ul className="grid gap-2 text-sm">
          {past.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2">
              <span>
                {dt(r.pickup_datetime)} · {r.nom} · {r.depart} → {r.destination ?? r.arrivee}
              </span>
              <span>
                {STATUS_LABELS[r.status] ?? r.status} · {r.prix_estime ? eur(Number(r.prix_estime)) : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ─────────────── Messages ─────────────── */

export function MessagesTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);
  const [text, setText] = useState("");
  const threads = useQuery({
    queryKey: ["driver-threads", token],
    queryFn: () => driverThreads({ data: { as: getProfile(), token } }),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
  const messages = useQuery({
    queryKey: ["driver-thread", token, open],
    enabled: !!open,
    queryFn: () => driverThreadMessages({ data: { as: getProfile(), token, reservationId: open! } }),
    refetchInterval: 6000,
    refetchOnWindowFocus: true,
  });
  // Messages clients reçus instantanément.
  useReservationsRealtime({
    queryKeys: [["driver-threads", token], ["driver-thread", token, open]],
    tables: ["reservation_messages", "direct_messages"],
    channel: "driver-messages",
  });
  const send = useMutation({
    mutationFn: (content: string) =>
      driverSendMessage({ data: { as: getProfile(), token, reservationId: open!, content } }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["driver-thread", token, open] });
      qc.invalidateQueries({ queryKey: ["driver-threads", token] });
    },
    onError: () => toast.error("Envoi impossible"),
  });

  const list = threads.data?.threads ?? [];
  return (
    <div className="grid gap-4">
      <Card title="Conversations">
        {list.length === 0 ? (
          <p className="text-sm">Aucun message pour l'instant.</p>
        ) : (
          <ul className="grid gap-2">
            {list.map((t) => (
              <li key={t.reservation_id}>
                <button
                  type="button"
                  className="w-full rounded-lg border border-white/10 p-3 text-left text-sm"
                  onClick={() => setOpen(open === t.reservation_id ? null : t.reservation_id)}
                >
                  <strong>{t.client}</strong>
                  {t.unread > 0 ? <span className="drv-tab-count"> {t.unread} non lus</span> : null}
                  <br />
                  <span className="opacity-70">
                    {t.last_message.slice(0, 90)} · {dt(t.last_at)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {open ? (
        <Card title="Conversation">
          <ul className="grid gap-2 text-sm">
            {(messages.data?.messages ?? []).map((m) => (
              <li key={m.id} className={m.sender === "chauffeur" ? "text-right" : ""}>
                <span className="inline-block rounded-lg border border-white/10 px-3 py-2">
                  {m.content}
                </span>
                <div className="text-xs opacity-60">{dt(m.created_at)}</div>
              </li>
            ))}
          </ul>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) send.mutate(text.trim());
            }}
          >
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Votre message…" />
            <Button type="submit" variant="default" disabled={send.isPending}>
              Envoyer
            </Button>
          </form>
        </Card>
      ) : null}
    </div>
  );
}

/* ─────────────── Clients ─────────────── */

export function ClientsTab({ token }: { token: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const { data } = useQuery({
    queryKey: ["driver-clients", token],
    queryFn: () => driverClients({ data: { as: getProfile(), token } }),
  });
  const clients = (data?.clients ?? []).filter((c) =>
    (c.name + " " + (c.phone ?? "")).toLowerCase().includes(q.toLowerCase()),
  );
  const openClient = clients.find((c) => (c.phone ?? c.name) === open) ?? null;
  const history = useQuery({
    queryKey: ["driver-client-history", token, open],
    enabled: !!openClient,
    queryFn: () =>
      driverClientHistory({
        data: { as: getProfile(), token, phone: openClient!.phone, name: openClient!.name },
      }),
  });
  return (
    <div className="grid gap-4">
      <Card title={`Clients (${clients.length})`}>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un nom ou un téléphone"
          className="mb-3"
        />
        <ul className="grid gap-2 text-sm">
          {clients.map((c) => {
            const key = c.phone ?? c.name;
            return (
              <li key={key} className="rounded-lg border border-white/10 p-3">
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center justify-between gap-2 text-left"
                  onClick={() => setOpen(open === key ? null : key)}
                >
                  <span>
                    <strong>{c.name}</strong>
                    {c.phone ? <> {" · "}<a href={`tel:${c.phone}`} onClick={(e) => e.stopPropagation()}>{c.phone}</a></> : null}
                  </span>
                  <span>
                    {c.rides} course{c.rides > 1 ? "s" : ""} · {eur(c.revenue)}
                  </span>
                </button>
                {open === key ? (
                  <div className="mt-3 grid gap-3 border-t border-white/10 pt-3 text-xs opacity-90">
                    {(history.data?.addresses ?? []).length > 0 ? (
                      <div>
                        <p className="mb-1 font-semibold">Adresses habituelles</p>
                        <ul className="grid gap-1">
                          {(history.data?.addresses ?? []).map((a) => (
                            <li key={a.address} className="flex justify-between gap-2">
                              <span>{a.address}</span>
                              <span className="opacity-70">×{a.count}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {(history.data?.notes ?? []).length > 0 ? (
                      <div>
                        <p className="mb-1 font-semibold">Remarques du client</p>
                        <ul className="grid gap-1">
                          {(history.data?.notes ?? []).map((n, i) => (
                            <li key={`${n.at}-${i}`}>
                              <span className="opacity-70">{dt(n.at)} · </span>
                              {n.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div>
                      <p className="mb-1 font-semibold">Courses passées</p>
                      <ul className="grid gap-1">
                        {(history.data?.rides ?? []).length === 0 ? (
                          <li>{history.isLoading ? "Chargement…" : "Aucune course connue."}</li>
                        ) : (
                          (history.data?.rides ?? []).map((r) => (
                            <li key={r.id} className="flex flex-wrap justify-between gap-2">
                              <span>
                                {dt(r.pickup_datetime)} · {r.depart} → {r.destination ?? r.arrivee}
                                {r.distance_km ? ` · ${r.distance_km} km` : ""}
                              </span>
                              <span>
                                {STATUS_LABELS[r.status] ?? r.status} ·{" "}
                                {r.prix_final ?? r.prix_estime
                                  ? eur(Number(r.prix_final ?? r.prix_estime))
                                  : "—"}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

/* ─────────────── Avis ─────────────── */

export function AvisTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["driver-avis", token],
    queryFn: () => driverAvisList({ data: { as: getProfile(), token } }),
  });
  // Nouvel avis client affiché sans recharger.
  useReservationsRealtime({
    queryKeys: [["driver-avis", token]],
    tables: ["avis"],
    channel: "driver-avis",
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["driver-avis", token] });
  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: "approved" | "rejected" | "pending" }) =>
      driverAvisSetStatus({ data: { as: getProfile(), token, ...v } }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => driverAvisDelete({ data: { as: getProfile(), token, id } }),
    onSuccess: invalidate,
  });
  const list = data?.avis ?? [];
  return (
    <Card title={`Avis (${list.length})`}>
      <ul className="grid gap-3 text-sm">
        {list.map((a) => (
          <li key={a.id} className="rounded-lg border border-white/10 p-3">
            <div className="flex items-center justify-between gap-2">
              <strong>
                {a.author_name} · {"★".repeat(a.note)}
              </strong>
              <span className="opacity-70">{a.status}</span>
            </div>
            {a.commentaire ? <p className="mt-1 opacity-80">{a.commentaire}</p> : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="default" onClick={() => setStatus.mutate({ id: a.id, status: "approved" })}>
                Publier
              </Button>
              <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: a.id, status: "rejected" })}>
                Masquer
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (window.confirm("Supprimer cet avis ?")) remove.mutate(a.id);
                }}
              >
                Supprimer
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ─────────────── Statistiques ─────────────── */

export function StatsTab({ token }: { token: string }) {
  const { data } = useQuery({
    queryKey: ["driver-stats", token],
    queryFn: () => driverStats({ data: { as: getProfile(), token } }),
  });
  if (!data) return <Card title="Statistiques">Chargement…</Card>;
  return (
    <div className="grid gap-4">
      <Card title="Vue d'ensemble (12 mois)">
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div>
            <div className="opacity-70">Courses</div>
            <strong>{data.totals.rides}</strong>
          </div>
          <div>
            <div className="opacity-70">Chiffre d'affaires</div>
            <strong>{eur(data.totals.revenue)}</strong>
          </div>
          <div>
            <div className="opacity-70">Panier moyen</div>
            <strong>{eur(data.totals.avgTicket)}</strong>
          </div>
          <div>
            <div className="opacity-70">Kilomètres</div>
            <strong>{data.totals.km} km</strong>
          </div>
        </div>
        {data.avgNote ? (
          <p className="mt-3 text-sm">Note moyenne des avis publiés : {data.avgNote} / 5</p>
        ) : null}
      </Card>
      <Card title="Par statut">
        <ul className="grid gap-1 text-sm">
          {data.byStatus.map((s) => (
            <li key={s.status} className="flex justify-between">
              <span>{STATUS_LABELS[s.status] ?? s.status}</span>
              <span>{s.count}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Par mois">
        <ul className="grid gap-1 text-sm">
          {data.byMonth.map((m) => (
            <li key={m.month} className="flex justify-between">
              <span>{m.month}</span>
              <span>
                {m.rides} · {eur(m.revenue)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Par chauffeur">
        <ul className="grid gap-1 text-sm">
          {data.byDriver.map((d) => (
            <li key={d.slug} className="flex justify-between">
              <span>{d.name}</span>
              <span>
                {d.rides} · {eur(d.revenue)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Destinations les plus demandées">
        <ul className="grid gap-1 text-sm">
          {data.topDestinations.map((d) => (
            <li key={d.label} className="flex justify-between">
              <span>{d.label}</span>
              <span>{d.count}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ─────────────── Simulateur ─────────────── */

export function SimulatorTab() {
  const [depart, setDepart] = useState("");
  const [arrivee, setArrivee] = useState("");
  const [when, setWhen] = useState("");
  const quote = useMutation({
    mutationFn: () => quoteRide({ data: { depart, arrivee, ...(when ? { when } : {}) } }),
    onError: () => toast.error("Calcul impossible"),
  });
  const res = quote.data;
  return (
    <Card title="Simulateur de tarif">
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (depart.trim().length > 2 && arrivee.trim().length > 2) quote.mutate();
        }}
      >
        <Input value={depart} onChange={(e) => setDepart(e.target.value)} placeholder="Départ" />
        <Input value={arrivee} onChange={(e) => setArrivee(e.target.value)} placeholder="Destination" />
        <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        <Button type="submit" variant="default" disabled={quote.isPending}>
          {quote.isPending ? "Calcul…" : "Calculer"}
        </Button>
      </form>
      {res?.ok ? (
        <p className="mt-4 text-sm">
          {res.distance_km} km · {Math.round(res.duree_s / 60)} min · tarif {res.nuit ? "nuit" : "jour"} (
          {res.detail.tarifKm.toFixed(2)} €/km) · <strong>{eur(res.prix)}</strong>
        </p>
      ) : null}
      {res && !res.ok ? <p className="mt-4 text-sm">Adresse introuvable.</p> : null}
    </Card>
  );
}

/* ─────────────── Position GPS ─────────────── */

export function GpsTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const [sharing, setSharing] = useState(false);
  const { data } = useQuery({
    queryKey: ["driver-gps", token],
    queryFn: () => driverGpsState({ data: { as: getProfile(), token } }),
    refetchInterval: 20000,
  });
  const push = useMutation({
    mutationFn: (v: { latitude: number; longitude: number; accuracy: number | null; speed: number | null; heading: number | null }) =>
      driverGpsPush({ data: { as: getProfile(), token, ...v, active: true } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["driver-gps", token] }),
  });
  const stop = useMutation({
    mutationFn: () => driverGpsStop({ data: { as: getProfile(), token } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["driver-gps", token] }),
  });

  useEffect(() => {
    if (!sharing || typeof navigator === "undefined" || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) =>
        push.mutate({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
          speed: pos.coords.speed ?? null,
          heading: pos.coords.heading ?? null,
        }),
      () => toast.error("Position indisponible"),
      { enableHighAccuracy: true, maximumAge: 10000 },
    );
    return () => navigator.geolocation.clearWatch(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharing]);

  const rows = data?.rows ?? [];
  const names: Record<string, string> = { equipe: "Ayoub & Adam" };
  const withPos = rows.filter((r) => r.latitude != null && r.longitude != null);
  const distKm =
    withPos.length === 2
      ? haversineKm(
          { lat: withPos[0]!.latitude as number, lng: withPos[0]!.longitude as number },
          { lat: withPos[1]!.latitude as number, lng: withPos[1]!.longitude as number },
        )
      : null;

  return (
    <Card title="Position GPS">
      <div className="flex flex-wrap gap-2">
        <Button variant="default" onClick={() => setSharing(true)} disabled={sharing}>
          Partager ma position
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setSharing(false);
            stop.mutate();
          }}
        >
          Arrêter
        </Button>
      </div>
      <div className="mt-4">
        <TeamMap rows={rows} names={names} />
      </div>
      {distKm != null ? (
        <p className="mt-2 text-xs text-muted-foreground">
          ≈ {distKm.toFixed(1)} km à vol d'oiseau entre les deux appareils.
        </p>
      ) : null}
      <ul className="mt-4 grid gap-2 text-sm">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap justify-between gap-2">
            <span>
              {names[r.id] ?? r.id} · {r.is_active ? "actif" : "inactif"}
            </span>
            <span>
              {r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)} · {dt(r.updated_at)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}


/* ─────────────── Appareils ─────────────── */

export function DevicesTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["driver-devices", token],
    queryFn: () => driverDevices({ data: { as: getProfile(), token } }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => driverDeviceDelete({ data: { as: getProfile(), token, id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["driver-devices", token] }),
  });
  const test = useMutation({
    mutationFn: (deviceId?: string) =>
      driverTestPush({ data: deviceId ? { token, deviceId } : { token } }),
    onSuccess: (r) => {
      if (r.sent > 0) toast.success(`Notification de test envoyée (${r.sent} appareil(s))`);
      else toast.error(r.diagnostic ?? "Aucun appareil n'a reçu la notification");
      void qc.invalidateQueries({ queryKey: ["driver-push-failures", token] });
    },
    onError: () => toast.error("Envoi impossible"),
  });
  const journal = useQuery({
    queryKey: ["driver-push-failures", token],
    queryFn: () => driverPushFailures({ data: { as: getProfile(), token } }),
  });
  const devices = data?.devices ?? [];
  const label = useMemo(
    () => (ua: string | null) => {
      if (!ua) return "Appareil inconnu";
      if (/iphone|ipad/i.test(ua)) return "iPhone / iPad";
      if (/android/i.test(ua)) return "Android";
      if (/mac/i.test(ua)) return "Mac";
      if (/windows/i.test(ua)) return "Windows";
      return "Navigateur";
    },
    [],
  );
  const failures = journal.data?.failures ?? [];
  const sends = journal.data?.sends ?? [];
  return (
    <div className="grid gap-4">
      <Card title={`Appareils recevant les notifications (${devices.length})`}>
        <Button variant="default" onClick={() => test.mutate(undefined)} disabled={test.isPending}>
          Envoyer une notification de test à tous
        </Button>
        <ul className="mt-4 grid gap-2 text-sm">
          {devices.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-2">
              <span>
                {label(d.user_agent)} · dernier contact {dt(d.last_seen_at)}
              </span>
              <span className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => test.mutate(d.id)}
                  disabled={test.isPending}
                >
                  Tester
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove.mutate(d.id)}>
                  Retirer
                </Button>
              </span>
            </li>
          ))}
          {devices.length === 0 ? (
            <li className="text-muted-foreground">
              Aucun appareil enregistré. Ouvrez l'app installée puis activez les notifications.
            </li>
          ) : null}
        </ul>
      </Card>

      <Card title="Diagnostic de cet appareil">
        <PushDebug />
      </Card>

      <Card title={`Notifications non délivrées (${failures.length})`}>
        {failures.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun échec enregistré. Tout est parti correctement.</p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {failures.map((f) => (
              <li key={f.id} className="rounded-lg border border-border p-3">
                <p className="font-medium">{f.title ?? "Notification"}</p>
                <p className="text-xs text-muted-foreground">
                  {dt(f.created_at)} · {f.audience === "chauffeur" ? "chauffeur" : "client"} ·{" "}
                  {f.user_agent ? f.user_agent.slice(0, 60) : `appareil …${f.fcm_token_suffix ?? ""}`}
                </p>
                <p className="text-xs text-destructive">
                  Code {f.http_status ?? "?"} {f.error_code ?? ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Derniers envois">
        <ul className="grid gap-1 text-xs text-muted-foreground">
          {sends.map((s) => (
            <li key={s.id}>
              {dt(s.created_at)} · {s.title ?? s.tag ?? "notification"} · {s.audience} ·{" "}
              {s.http_status === 200 ? "délivré" : `code ${s.http_status ?? "?"}`}
            </li>
          ))}
          {sends.length === 0 ? <li>Aucun envoi récent.</li> : null}
        </ul>
      </Card>
    </div>
  );
}
