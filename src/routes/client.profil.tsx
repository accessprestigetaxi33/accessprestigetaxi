import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LogOut, Plus, Trash2, Home, Briefcase, Plane, MapPin, ExternalLink, Repeat, Power } from "lucide-react";
import { BrandLoader } from "@/components/BrandLoader";
import { toast } from "sonner";
import { ClientBottomNav } from "@/components/ClientBottomNav";
import { useT } from "@/i18n/I18nProvider";
import { getClientSession, clearClientSession } from "@/lib/client-session";
import { clientLogout } from "@/lib/client-auth.functions";
import type { ClientSession } from "@/lib/client-auth.functions";
import {
  listClientFavorites,
  upsertClientFavorite,
  deleteClientFavorite,
  type ClientFavorite,
} from "@/lib/client-favorites.functions";
import {
  listRecurringRides,
  createRecurringRide,
  toggleRecurringRide,
  deleteRecurringRide,
  type RecurringRide,
} from "@/lib/client-recurring.functions";

export const Route = createFileRoute("/client/profil")({
  head: () => ({
    meta: [{ title: "Mon profil — Access Prestige Taxi" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ClientProfil,
});

const ICONS: Record<string, typeof Home> = {
  home: Home,
  briefcase: Briefcase,
  plane: Plane,
  pin: MapPin,
};

const PRESETS = [
  { label: "Maison", icon: "home", tKey: "profil.favorites.preset.home" },
  { label: "Bureau", icon: "briefcase", tKey: "profil.favorites.preset.office" },
  { label: "Aéroport", icon: "plane", tKey: "profil.favorites.preset.airport" },
  { label: "Autre", icon: "pin", tKey: "profil.favorites.preset.other" },
];

const css = `
.cp-root{min-height:100dvh;background:#030a13;color:#f5f1e8;font-family:Inter,system-ui,sans-serif;padding:0 0 82px}
.cp-main{padding:12px}
.cp-main-inner{max-width:390px;margin:0 auto}
.cp-shell{border-radius:24px;padding:13px;background:#030a13;box-shadow:0 0 40px rgba(214,168,61,.06)}
.cp-kicker{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#e6b95a}
.cp-title{font-family:Georgia,serif;font-size:20px;margin:4px 0 0}
.cp-identity{margin-top:14px;display:flex;align-items:center;gap:12px;border:1px solid rgba(214,168,61,.45);border-radius:14px;background:linear-gradient(145deg,#111b26,#07101a);padding:14px}
.cp-avatar{display:flex;height:52px;width:52px;flex-shrink:0;align-items:center;justify-content:center;border-radius:999px;font-size:16px;font-weight:800;color:#171006;background:linear-gradient(135deg,#f6cd6b,#cf962a)}
.cp-identity-name{font-size:14px;font-weight:600;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cp-identity-sub{margin-top:2px;font-size:11px;color:rgba(255,255,255,.55);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cp-section{margin-top:22px}
.cp-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.cp-section-title{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.55)}
.cp-add-btn{display:inline-flex;align-items:center;gap:5px;border-radius:8px;padding:7px 11px;font-size:10px;font-weight:800;color:#171006;background:linear-gradient(135deg,#f6cd6b,#cf962a);border:none}
.cp-form{margin-bottom:10px;border:1px solid rgba(214,168,61,.45);border-radius:14px;background:#07101a;padding:14px}
.cp-form-presets{margin-bottom:10px;display:flex;flex-wrap:wrap;gap:6px}
.cp-preset{display:inline-flex;align-items:center;gap:6px;border-radius:999px;border:1px solid rgba(214,168,61,.35);background:rgba(255,255,255,.03);padding:6px 11px;font-size:11px;color:rgba(255,255,255,.6)}
.cp-preset.active{border-color:#d6a83d;background:rgba(214,168,61,.15);color:#e8c96d}
.cp-input,.cp-select,.cp-textarea{width:100%;border:1px solid rgba(214,168,61,.35);border-radius:8px;background:#0b1520;padding:9px 11px;font-size:12px;color:#f5f1e8;outline:none;margin-bottom:8px}
.cp-input:focus,.cp-select:focus,.cp-textarea:focus{border-color:#d6a83d}
.cp-textarea{resize:none}
.cp-form-actions{display:flex;gap:8px;margin-top:2px}
.cp-btn-primary{flex:1;border-radius:8px;padding:9px 14px;font-size:11px;font-weight:800;color:#171006;background:linear-gradient(135deg,#f6cd6b,#cf962a);border:none}
.cp-btn-primary:disabled{opacity:.6}
.cp-btn-ghost{border-radius:8px;border:1px solid rgba(214,168,61,.4);padding:9px 14px;font-size:11px;color:rgba(255,255,255,.7);background:transparent}
.cp-loading{display:flex;align-items:center;justify-content:center;gap:8px;border-radius:14px;background:#07101a;padding:26px 12px;color:rgba(255,255,255,.6);font-size:12px}
.cp-empty{padding:20px 14px;border:1px dashed rgba(214,168,61,.45);border-radius:14px;text-align:center;color:rgba(255,255,255,.55);font-size:11px}
.cp-list{display:flex;flex-direction:column;gap:8px}
.cp-row{display:flex;align-items:center;gap:10px;border:1px solid rgba(214,168,61,.45);border-radius:12px;background:linear-gradient(145deg,#111b26,#07101a);padding:11px}
.cp-row-icon{display:flex;height:38px;width:38px;flex-shrink:0;align-items:center;justify-content:center;border-radius:10px;background:rgba(214,168,61,.15);color:#e7bd5d}
.cp-row-main{min-width:0;flex:1}
.cp-row-title{font-size:12px;font-weight:600;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cp-row-sub{margin-top:1px;font-size:10px;color:rgba(255,255,255,.55);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cp-row-cta{display:inline-flex;align-items:center;gap:4px;border:1px solid rgba(214,168,61,.5);border-radius:8px;background:rgba(214,168,61,.1);padding:6px 9px;font-size:10px;font-weight:700;color:#e7bd5d;text-decoration:none;flex-shrink:0}
.cp-row-btn{border-radius:8px;padding:7px;color:rgba(255,255,255,.4);background:transparent;border:none;flex-shrink:0}
.cp-row-btn:hover{color:#fca5a5}
.cp-row[data-inactive="true"]{opacity:.5}
.cp-recur-note{margin-top:6px;font-size:10px;color:rgba(255,255,255,.4)}
.cp-company-link{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(214,168,61,.45);border-radius:8px;background:rgba(214,168,61,.1);padding:6px 11px;font-size:10px;font-weight:700;color:#e7bd5d;text-decoration:none}
.cp-company-box{border:1px solid rgba(214,168,61,.45);border-radius:14px;background:#07101a;padding:14px}
.cp-company-hint{margin-bottom:10px;font-size:10px;color:rgba(255,255,255,.45)}
.cp-grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.cp-logout{margin-top:24px;display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(214,168,61,.4);border-radius:10px;padding:10px 16px;font-size:12px;color:rgba(255,255,255,.7);background:transparent}
@media(min-width:700px){.cp-main-inner{max-width:720px}.cp-shell{padding:20px}}
`;

function ClientProfil() {
  const t = useT();
  const navigate = useNavigate();
  const [session, setSession] = useState<ClientSession | null>(null);
  const [favorites, setFavorites] = useState<ClientFavorite[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [formLabel, setFormLabel] = useState("Maison");
  const [formIcon, setFormIcon] = useState("home");
  const [formAddress, setFormAddress] = useState("");
  const [busy, setBusy] = useState(false);

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
      const data = await listClientFavorites({ data: { token: session.token } });
      setFavorites(data);
    } catch {
      toast.error("Impossible de charger vos favoris");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) refresh();
  }, [session, refresh]);

  async function onSave() {
    if (!session || !formAddress.trim()) {
      toast.error("Adresse requise");
      return;
    }
    setBusy(true);
    try {
      await upsertClientFavorite({
        data: {
          token: session.token,
          label: formLabel.trim() || "Adresse",
          address: formAddress.trim(),
          icon: formIcon,
        },
      });
      toast.success("Adresse ajoutée");
      setAdding(false);
      setFormLabel("Maison");
      setFormIcon("home");
      setFormAddress("");
      refresh();
    } catch {
      toast.error(t("profil.company.toast.failed"));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!session) return;
    if (!confirm("Supprimer cette adresse favorite ?")) return;
    try {
      await deleteClientFavorite({ data: { token: session.token, id } });
      refresh();
    } catch {
      toast.error("Échec de la suppression");
    }
  }

  function logout() {
    void clientLogout({ data: { token: session?.token ?? "" } }).catch(() => {});
    clearClientSession();
    navigate({ to: "/" });
  }

  if (!session) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="cp-root">
        <main className="cp-main">
          <div className="cp-main-inner">
            <div className="cp-shell">
              <div className="cp-kicker">{t("profil.eyebrow")}</div>
              <h1 className="cp-title">{t("profil.title")}</h1>

              {/* Identity card */}
              <div className="cp-identity">
                <div className="cp-avatar">{(session.name || session.email).slice(0, 2).toUpperCase()}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="cp-identity-name">{session.name || t("profil.client_vip")}</div>
                  <div className="cp-identity-sub">{session.email}</div>
                  <div className="cp-identity-sub">{session.phone}</div>
                </div>
              </div>

              {/* Favorites */}
              <section className="cp-section">
                <div className="cp-section-head">
                  <h2 className="cp-section-title">{t("profil.favorites.title")}</h2>
                  {!adding && (
                    <button className="cp-add-btn" onClick={() => setAdding(true)}>
                      <Plus size={13} /> {t("profil.favorites.add")}
                    </button>
                  )}
                </div>

                {adding && (
                  <div className="cp-form">
                    <div className="cp-form-presets">
                      {PRESETS.map((p) => {
                        const Icon = ICONS[p.icon];
                        const active = formLabel === p.label && formIcon === p.icon;
                        return (
                          <button
                            key={p.label}
                            type="button"
                            className={`cp-preset${active ? " active" : ""}`}
                            onClick={() => {
                              setFormLabel(p.label);
                              setFormIcon(p.icon);
                            }}
                          >
                            <Icon size={13} /> {t(p.tKey)}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      className="cp-input"
                      value={formLabel}
                      onChange={(e) => setFormLabel(e.target.value)}
                      placeholder={t("profil.favorites.name_ph")}
                    />
                    <input
                      className="cp-input"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder={t("profil.favorites.address_ph")}
                    />
                    <div className="cp-form-actions">
                      <button className="cp-btn-primary" onClick={onSave} disabled={busy}>
                        {busy ? "…" : t("profil.common.save")}
                      </button>
                      <button className="cp-btn-ghost" onClick={() => setAdding(false)}>
                        {t("profil.common.cancel")}
                      </button>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="cp-loading">
                    <BrandLoader size={18} /> {t("profil.common.loading")}
                  </div>
                )}

                {!loading && favorites && favorites.length === 0 && !adding && (
                  <div className="cp-empty">{t("profil.favorites.empty")}</div>
                )}

                {!loading && favorites && favorites.length > 0 && (
                  <div className="cp-list">
                    {favorites.map((f) => {
                      const Icon = ICONS[f.icon || "pin"] || MapPin;
                      return (
                        <div className="cp-row" key={f.id}>
                          <div className="cp-row-icon">
                            <Icon size={17} />
                          </div>
                          <div className="cp-row-main">
                            <div className="cp-row-title">{f.label}</div>
                            <div className="cp-row-sub">{f.address}</div>
                          </div>
                          <a
                            href={`/reserver?depart=${encodeURIComponent(f.address)}`}
                            className="cp-row-cta"
                            title={t("profil.favorites.book_from")}
                          >
                            <ExternalLink size={11} /> {t("profil.favorites.book")}
                          </a>
                          <button
                            className="cp-row-btn"
                            onClick={() => onDelete(f.id)}
                            aria-label={t("profil.favorites.delete")}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <RecurringRidesSection token={session.token} />

              <CompanyInfoSection token={session.token} />

              <button className="cp-logout" onClick={logout}>
                <LogOut size={15} /> {t("profil.logout")}
              </button>
            </div>
          </div>
        </main>
        <ClientBottomNav />
      </div>
    </>
  );
}

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function RecurringRidesSection({ token }: { token: string }) {
  const t = useT();
  const [rides, setRides] = useState<RecurringRide[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    label: "Domicile → Aéroport",
    depart: "",
    destination: "",
    day_of_week: 5,
    hour: 7,
    minute: 0,
    passagers: 1,
    bagages: 1,
    paiement: "cb" as "cb" | "especes",
    message: "",
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listRecurringRides({ data: { token } });
      setRides(data);
    } catch {
      toast.error(t("profil.recurring.toast.load_failed"));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onCreate() {
    if (!form.depart.trim() || !form.destination.trim()) {
      toast.error(t("profil.recurring.toast.required"));
      return;
    }
    setBusy(true);
    try {
      await createRecurringRide({ data: { token, ...form } });
      toast.success(t("profil.recurring.toast.created"));
      setAdding(false);
      setForm({
        label: "Domicile → Aéroport",
        depart: "",
        destination: "",
        day_of_week: 5,
        hour: 7,
        minute: 0,
        passagers: 1,
        bagages: 1,
        paiement: "cb",
        message: "",
      });
      refresh();
    } catch {
      toast.error(t("profil.recurring.toast.create_failed"));
    } finally {
      setBusy(false);
    }
  }

  async function onToggle(r: RecurringRide) {
    try {
      await toggleRecurringRide({ data: { token, id: r.id, active: !r.active } });
      refresh();
    } catch {
      toast.error(t("profil.recurring.toast.failed"));
    }
  }

  async function onDelete(id: string) {
    if (!confirm(t("profil.recurring.confirm_delete"))) return;
    try {
      await deleteRecurringRide({ data: { token, id } });
      refresh();
    } catch {
      toast.error(t("profil.recurring.toast.failed"));
    }
  }

  return (
    <section className="cp-section">
      <div className="cp-section-head">
        <h2 className="cp-section-title">
          <Repeat size={14} /> {t("profil.recurring.title")}
        </h2>
        {!adding && (
          <button className="cp-add-btn" onClick={() => setAdding(true)}>
            <Plus size={13} /> {t("profil.recurring.new")}
          </button>
        )}
      </div>

      {adding && (
        <div className="cp-form">
          <input
            className="cp-input"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder={t("profil.recurring.label_ph")}
          />
          <input
            className="cp-input"
            value={form.depart}
            onChange={(e) => setForm({ ...form, depart: e.target.value })}
            placeholder={t("profil.recurring.depart_ph")}
          />
          <input
            className="cp-input"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            placeholder={t("profil.recurring.dest_ph")}
          />
          <div className="cp-grid2" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 8 }}>
            <select
              className="cp-select"
              style={{ marginBottom: 0 }}
              value={form.day_of_week}
              onChange={(e) => setForm({ ...form, day_of_week: parseInt(e.target.value, 10) })}
            >
              {DAYS.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </select>
            <select
              className="cp-select"
              style={{ marginBottom: 0 }}
              value={form.hour}
              onChange={(e) => setForm({ ...form, hour: parseInt(e.target.value, 10) })}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}h
                </option>
              ))}
            </select>
            <select
              className="cp-select"
              style={{ marginBottom: 0 }}
              value={form.minute}
              onChange={(e) => setForm({ ...form, minute: parseInt(e.target.value, 10) })}
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
          <div className="cp-grid2" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 8 }}>
            <select
              className="cp-select"
              style={{ marginBottom: 0 }}
              value={form.passagers}
              onChange={(e) => setForm({ ...form, passagers: parseInt(e.target.value, 10) })}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} pax
                </option>
              ))}
            </select>
            <select
              className="cp-select"
              style={{ marginBottom: 0 }}
              value={form.bagages}
              onChange={(e) => setForm({ ...form, bagages: parseInt(e.target.value, 10) })}
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} bag.
                </option>
              ))}
            </select>
            <select
              className="cp-select"
              style={{ marginBottom: 0 }}
              value={form.paiement}
              onChange={(e) => setForm({ ...form, paiement: e.target.value as "cb" | "especes" })}
            >
              <option value="cb">CB</option>
              <option value="especes">Espèces</option>
            </select>
          </div>
          <textarea
            className="cp-textarea"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value.slice(0, 500) })}
            placeholder={t("profil.recurring.msg_ph")}
            rows={2}
          />
          <div className="cp-form-actions">
            <button className="cp-btn-primary" onClick={onCreate} disabled={busy}>
              {busy ? "…" : t("profil.recurring.create")}
            </button>
            <button className="cp-btn-ghost" onClick={() => setAdding(false)}>
              {t("profil.common.cancel")}
            </button>
          </div>
          <p className="cp-recur-note">{t("profil.recurring.auto_note")}</p>
        </div>
      )}

      {loading && (
        <div className="cp-loading">
          <BrandLoader size={18} /> {t("profil.common.loading")}
        </div>
      )}

      {!loading && rides && rides.length === 0 && !adding && (
        <div className="cp-empty">{t("profil.recurring.empty")}</div>
      )}

      {!loading && rides && rides.length > 0 && (
        <div className="cp-list">
          {rides.map((r) => (
            <div className="cp-row" data-inactive={!r.active} key={r.id}>
              <div className="cp-row-icon">
                <Repeat size={17} />
              </div>
              <div className="cp-row-main">
                <div className="cp-row-title">{r.label}</div>
                <div className="cp-row-sub">
                  {r.depart} → {r.destination}
                </div>
                <div className="cp-row-sub" style={{ color: "#e7bd5d", marginTop: 3 }}>
                  {t("profil.recurring.every")}{" "}
                  {t(`profil.recurring.day.${["sun", "mon", "tue", "wed", "thu", "fri", "sat"][r.day_of_week]}`)}.{" "}
                  {t("profil.recurring.at")} {String(r.hour).padStart(2, "0")}h{String(r.minute).padStart(2, "0")} ·{" "}
                  {r.passagers} {t("profil.recurring.pax")} · {r.bagages} {t("profil.recurring.bag")}
                </div>
              </div>
              <button
                className="cp-row-btn"
                onClick={() => onToggle(r)}
                aria-label={r.active ? t("profil.recurring.pause") : t("profil.recurring.activate")}
                title={r.active ? t("profil.recurring.pause") : t("profil.recurring.activate")}
                style={{ color: "rgba(255,255,255,.5)" }}
              >
                <Power size={15} />
              </button>
              <button className="cp-row-btn" onClick={() => onDelete(r.id)} aria-label="Supprimer">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CompanyInfoSection({ token }: { token: string }) {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState({
    company_name: "",
    siret: "",
    tva_intracom: "",
    billing_address: "",
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { getClientCompanyInfo } = await import("@/lib/client-billing.functions");
      const data = await getClientCompanyInfo({ data: { token } });
      setCompany({
        company_name: data.company_name ?? "",
        siret: data.siret ?? "",
        tva_intracom: data.tva_intracom ?? "",
        billing_address: data.billing_address ?? "",
      });
    } catch {
      // silencieux : section optionnelle
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function save() {
    setSaving(true);
    try {
      const { updateClientCompanyInfo } = await import("@/lib/client-billing.functions");
      await updateClientCompanyInfo({
        data: {
          token,
          company_name: company.company_name.trim() || null,
          siret: company.siret.trim() || null,
          tva_intracom: company.tva_intracom.trim() || null,
          billing_address: company.billing_address.trim() || null,
        },
      });
      toast.success(t("profil.company.toast.saved"));
    } catch {
      toast.error(t("profil.company.toast.failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="cp-section">
      <div className="cp-section-head">
        <h2 className="cp-section-title">
          <Briefcase size={14} /> {t("profil.company.title")}
        </h2>
        <Link to="/client/factures" className="cp-company-link">
          {t("profil.company.invoices_link")}
        </Link>
      </div>
      {loading ? (
        <div className="cp-loading">
          <BrandLoader size={18} /> {t("profil.common.loading")}
        </div>
      ) : (
        <div className="cp-company-box">
          <p className="cp-company-hint">{t("profil.company.optional")}</p>
          <input
            className="cp-input"
            value={company.company_name}
            onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
            placeholder={t("profil.company.name_ph")}
          />
          <div className="cp-grid2">
            <input
              className="cp-input"
              value={company.siret}
              onChange={(e) => setCompany({ ...company, siret: e.target.value })}
              placeholder={t("profil.company.siret_ph")}
            />
            <input
              className="cp-input"
              value={company.tva_intracom}
              onChange={(e) => setCompany({ ...company, tva_intracom: e.target.value })}
              placeholder={t("profil.company.tva_ph")}
            />
          </div>
          <textarea
            className="cp-textarea"
            value={company.billing_address}
            onChange={(e) => setCompany({ ...company, billing_address: e.target.value })}
            placeholder={t("profil.company.billing_ph")}
            rows={2}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="cp-btn-primary" style={{ flex: "0 0 auto" }} onClick={save} disabled={saving}>
              {saving ? "…" : t("profil.common.save")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
