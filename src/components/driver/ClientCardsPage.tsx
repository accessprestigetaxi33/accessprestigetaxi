// Page plein écran « Fiches clients » (tableau de bord chauffeur).
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { driverClientCards, driverUpdateClientCard, type ClientCard } from "@/lib/driver-extra.functions";

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—";

export function ClientCardsPage({
  token,
  onClose,
  embedded = false,
}: {
  token: string;
  onClose: () => void;
  /** Intégrée dans une page fusionnée : pas d'en-tête ni de plein écran propres. */
  embedded?: boolean;
}) {
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<ClientCard | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["driver-client-cards", token],
    queryFn: () => driverClientCards({ data: { token } }),
    refetchInterval: 30_000,
  });
  const s = q.trim().toLowerCase();
  const cards = (data?.cards ?? []).filter(
    (c) => !s || [c.name, c.first_name, c.last_name, c.phone, c.email].some((v) => (v ?? "").toLowerCase().includes(s)),
  );

  return (
    <div className={embedded ? undefined : "drv-rides-page"}>
      {embedded ? null : (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <button type="button" className="drv-rides-btn" onClick={onClose}>
            ← Retour
          </button>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Fiches clients ({cards.length})</h2>
        </div>
      )}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher nom, téléphone, e-mail…"
        style={inputStyle}
      />
      {isLoading ? <p style={{ opacity: 0.7, marginTop: 12 }}>Chargement…</p> : null}
      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setEdit(c)}
            style={{
              textAlign: "left",
              padding: 14,
              borderRadius: 14,
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
            }}
          >
            <div style={{ fontWeight: 600 }}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.name}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
              📞 {c.phone ?? "—"} · ✉️ {c.email ?? "—"}
            </div>
            {c.address ? <div style={{ fontSize: 13, opacity: 0.85 }}>🏠 {c.address}</div> : null}
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              Dernier trajet : {fmt(c.last_ride_at)} — {c.last_depart ?? "—"} → {c.last_arrivee ?? "—"}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {c.total_courses} course(s) · {c.total_depense.toFixed(2).replace(".", ",")} €
            </div>
          </button>
        ))}
      </div>
      {edit ? <EditCard token={token} card={edit} onClose={() => setEdit(null)} /> : null}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.12)",
  color: "inherit",
};

function EditCard({ token, card, onClose }: { token: string; card: ClientCard; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({
    name: card.name ?? "",
    first_name: card.first_name ?? "",
    last_name: card.last_name ?? "",
    phone: card.phone ?? "",
    email: card.email ?? "",
    address: card.address ?? "",
    notes: card.notes ?? "",
  });
  const save = useMutation({
    mutationFn: () => driverUpdateClientCard({ data: { token, id: card.id, ...f } }),
    onSuccess: () => {
      toast.success("Fiche client enregistrée");
      qc.invalidateQueries({ queryKey: ["driver-client-cards", token] });
      onClose();
    },
    onError: () => toast.error("Vérifiez le téléphone et l'e-mail"),
  });
  const field = (k: keyof typeof f, label: string, multi = false) => (
    <label style={{ display: "block", marginTop: 10, fontSize: 13 }}>
      {label}
      {multi ? (
        <textarea
          rows={3}
          value={f[k]}
          onChange={(e) => setF({ ...f, [k]: e.target.value })}
          style={{ ...inputStyle, marginTop: 4 }}
        />
      ) : (
        <input
          value={f[k]}
          onChange={(e) => setF({ ...f, [k]: e.target.value })}
          style={{ ...inputStyle, marginTop: 4 }}
        />
      )}
    </label>
  );
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#18181b",
          borderRadius: 16,
          padding: 18,
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>Modifier la fiche client</h3>
        {field("name", "Nom affiché")}
        {field("first_name", "Prénom")}
        {field("last_name", "Nom")}
        {field("phone", "Téléphone")}
        {field("email", "E-mail")}
        {field("address", "Adresse")}
        {field("notes", "Remarques", true)}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" className="drv-rides-btn" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="drv-rides-btn drv-rides-btn-done"
            disabled={save.isPending || !f.name.trim()}
            onClick={() => save.mutate()}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
