import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Download, ArrowLeft, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { BrandLoader } from "@/components/BrandLoader";
import { ClientBottomNav } from "@/components/ClientBottomNav";
import { useT } from "@/i18n/I18nProvider";
import { getClientSession } from "@/lib/client-session";
import type { ClientSession } from "@/lib/client-auth.functions";
import {
  getClientCompanyInfo,
  listCompletedForBilling,
  type CompanyInfo,
  type InvoiceRow,
} from "@/lib/client-billing.functions";
import { downloadMonthlyInvoicePDF, downloadYearlyInvoicePDF } from "@/lib/client-invoices";

export const Route = createFileRoute("/client/historique")({
  head: () => ({
    meta: [{ title: "Mes factures — Access Prestige Taxi" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ClientFactures,
});

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

const css = `
.cf-root{min-height:100dvh;background:#030a13;color:#f5f1e8;font-family:Inter,system-ui,sans-serif;padding:0 0 82px}
.cf-main{padding:12px}
.cf-main-inner{max-width:390px;margin:0 auto}
.cf-shell{border-radius:24px;padding:13px;background:#030a13;box-shadow:0 0 40px rgba(214,168,61,.06)}
.cf-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.cf-back{display:inline-flex;align-items:center;gap:5px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.6);text-decoration:none}
.cf-year{border:1px solid rgba(214,168,61,.45);border-radius:8px;background:#0b1520;padding:6px 10px;font-size:11px;color:#f5f1e8}
.cf-kicker{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#e6b95a;margin-top:14px}
.cf-title{font-family:Georgia,serif;font-size:20px;margin:4px 0 0;display:flex;align-items:center;gap:8px}
.cf-subtitle{margin-top:4px;font-size:11px;color:rgba(255,255,255,.55)}
.cf-prompt{margin-top:14px;border:1px solid rgba(214,168,61,.35);border-radius:12px;background:rgba(214,168,61,.06);padding:12px;display:flex;gap:10px;font-size:11px;color:rgba(255,255,255,.75);line-height:1.5}
.cf-prompt a{margin-left:6px;font-weight:700;color:#e7bd5d;text-decoration:underline}
.cf-loading{display:flex;align-items:center;justify-content:center;gap:8px;border-radius:14px;background:#07101a;padding:34px 12px;color:rgba(255,255,255,.6);font-size:12px;margin-top:14px}
.cf-empty{margin-top:14px;padding:24px 16px;border:1px dashed rgba(214,168,61,.45);border-radius:14px;text-align:center;color:rgba(255,255,255,.55);font-size:11px}
.cf-recap{margin-top:14px;border:1px solid rgba(214,168,61,.35);border-radius:14px;padding:14px;background:linear-gradient(135deg,rgba(214,168,61,.14),rgba(232,201,109,.04));display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px}
.cf-recap-label{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#e6b95a}
.cf-recap-total{margin-top:4px;font-family:Georgia,serif;font-size:21px;color:#fff}
.cf-recap-total span{font-family:Inter,sans-serif;font-size:11px;font-weight:400;color:rgba(255,255,255,.55);margin-left:4px}
.cf-recap-btn{display:inline-flex;align-items:center;gap:6px;border-radius:8px;padding:9px 14px;font-size:11px;font-weight:800;color:#171006;background:linear-gradient(135deg,#f6cd6b,#cf962a);border:none}
.cf-recap-btn:disabled{opacity:.6}
.cf-by-month{margin:18px 0 8px;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.45)}
.cf-months{display:flex;flex-direction:column;gap:8px}
.cf-month{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;border:1px solid rgba(214,168,61,.45);border-radius:12px;background:linear-gradient(145deg,#111b26,#07101a);padding:12px}
.cf-month-name{font-size:12px;font-weight:600;text-transform:capitalize;color:#f5f1e8}
.cf-month-sub{margin-top:2px;font-size:10px;color:rgba(255,255,255,.5)}
.cf-month-pdf{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(214,168,61,.5);border-radius:7px;padding:7px 10px;font-size:9px;font-weight:800;color:#e7bd5d;background:transparent}
.cf-month-pdf:disabled{opacity:.5}
@media(min-width:700px){.cf-main-inner{max-width:720px}.cf-shell{padding:20px}}
`;

function ClientFactures() {
  const navigate = useNavigate();
  const t = useT();
  const [session, setSession] = useState<ClientSession | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState<InvoiceRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

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
      const [comp, data] = await Promise.all([
        getClientCompanyInfo({ data: { token: session.token } }),
        listCompletedForBilling({
          data: {
            token: session.token,
            from: new Date(year, 0, 1).toISOString(),
            to: new Date(year + 1, 0, 1).toISOString(),
          },
        }),
      ]);
      setCompany(comp);
      setRows(data);
    } catch (e) {
      console.error(e);
      toast.error("Impossible de charger vos factures");
    } finally {
      setLoading(false);
    }
  }, [session, year]);

  useEffect(() => {
    if (session) refresh();
  }, [session, refresh]);

  const byMonth = useMemo(() => {
    const map = new Map<number, InvoiceRow[]>();
    for (const r of rows ?? []) {
      const m = new Date(r.date).getMonth() + 1;
      if (!map.has(m)) map.set(m, []);
      map.get(m)!.push(r);
    }
    return map;
  }, [rows]);

  const totalYear = useMemo(() => (rows ?? []).reduce((s, r) => s + r.prix_estime, 0), [rows]);

  function downloadMonth(month: number) {
    if (!session || !company) return;
    const list = byMonth.get(month) ?? [];
    if (list.length === 0) return;
    setBusy(`m-${month}`);
    try {
      downloadMonthlyInvoicePDF({
        accountId: session.id,
        year,
        month,
        rows: list,
        client: { name: session.name || "", email: session.email || "", phone: session.phone || "" },
        company,
      });
    } finally {
      setBusy(null);
    }
  }

  function downloadYear() {
    if (!session || !company || !rows || rows.length === 0) return;
    setBusy("year");
    try {
      downloadYearlyInvoicePDF({
        accountId: session.id,
        year,
        rows,
        client: { name: session.name || "", email: session.email || "", phone: session.phone || "" },
        company,
      });
    } finally {
      setBusy(null);
    }
  }

  const years = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="cf-root">
        <main className="cf-main">
          <div className="cf-main-inner">
            <div className="cf-shell">
              <div className="cf-top">
                <Link to="/client/profil" className="cf-back">
                  <ArrowLeft size={13} /> Profil
                </Link>
                <select className="cf-year" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cf-kicker">{t("client.eyebrow")}</div>
              <h1 className="cf-title">
                <FileText size={18} style={{ color: "#e7bd5d" }} /> {t("client.factures.title")}
              </h1>
              <p className="cf-subtitle">{t("client.factures.subtitle")}</p>

              {!company?.company_name && (
                <div className="cf-prompt">
                  <Briefcase size={15} style={{ color: "#e7bd5d", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    {t("client.factures.company_prompt")}
                    <Link to="/client/profil">{t("client.factures.complete_profile")}</Link>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="cf-loading">
                  <BrandLoader size={18} /> {t("client.trajets.loading")}
                </div>
              ) : (rows ?? []).length === 0 ? (
                <div className="cf-empty">
                  {t("client.factures.empty_year")} {year}.
                </div>
              ) : (
                <>
                  <div className="cf-recap">
                    <div>
                      <div className="cf-recap-label">
                        {t("client.factures.year_label")} {year}
                      </div>
                      <div className="cf-recap-total">
                        {totalYear.toFixed(2)} €
                        <span>
                          / {(rows ?? []).length} {t("client.factures.courses")}
                        </span>
                      </div>
                    </div>
                    <button className="cf-recap-btn" onClick={downloadYear} disabled={busy === "year"}>
                      <Download size={14} /> {t("client.factures.year_pdf")}
                    </button>
                  </div>

                  <p className="cf-by-month">{t("client.factures.by_month")}</p>
                  <div className="cf-months">
                    {Array.from(byMonth.entries())
                      .sort(([a], [b]) => b - a)
                      .map(([month, list]) => {
                        const total = list.reduce((s, r) => s + r.prix_estime, 0);
                        return (
                          <div className="cf-month" key={month}>
                            <div>
                              <div className="cf-month-name">{monthLabel(year, month)}</div>
                              <div className="cf-month-sub">
                                {list.length} course{list.length > 1 ? "s" : ""} · {total.toFixed(2)} €
                              </div>
                            </div>
                            <button
                              className="cf-month-pdf"
                              onClick={() => downloadMonth(month)}
                              disabled={busy === `m-${month}`}
                            >
                              <Download size={12} /> PDF
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
        <ClientBottomNav />
      </div>
    </>
  );
}
