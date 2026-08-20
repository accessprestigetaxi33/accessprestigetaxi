import { socialImageMeta } from "@/lib/og";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { seoLinks } from "@/lib/seo-hreflang";
import { useState } from "react";
import { CheckCircle2, Clock, FileSearch, Loader2, XCircle } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { getDevisStatus } from "@/lib/devis.functions";

const SITE = "https://www.accessprestigetaxi.fr";
const TITLE = "Suivre ma demande de devis — Access Prestige Taxi";
const DESC =
  "Consultez l'état de votre demande de devis taxi en Charente-Maritime avec votre numéro de référence et votre e-mail.";

export const Route = createFileRoute("/devis/suivi")({
  validateSearch: (search: Record<string, unknown>) => ({
    ref: typeof search.ref === "string" ? search.ref.slice(0, 20) : undefined,
  }),
  head: ({ match }) => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/devis/suivi` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      // Page de consultation personnelle : utile aux clients, sans intérêt pour l'index.
      { name: "robots", content: "noindex, follow" },
      ...socialImageMeta(TITLE),
    ],
    links: seoLinks("/devis/suivi", match.search),
  }),
  component: SuiviDevisPage,
});

const COPY = {
  fr: {
    eyebrow: "Suivi de demande",
    h1: "Suivre ma demande de devis",
    lead: "Saisissez le numéro de référence reçu par e-mail et l'adresse e-mail utilisée lors de la demande.",
    ref: "Numéro de référence",
    email: "E-mail",
    submit: "Consulter ma demande",
    loading: "Recherche…",
    notFound: "Aucune demande ne correspond à cette référence et à cet e-mail.",
    error: "La recherche a échoué. Merci de réessayer.",
    statutTitle: "État de votre demande",
    statuts: {
      recu: { l: "Demande reçue", d: "Votre demande est enregistrée, nos chauffeurs la traitent." },
      en_cours: { l: "En cours d'étude", d: "Alain et Patricia calculent votre prix ferme." },
      devis_envoye: { l: "Devis envoyé", d: "Votre devis vous a été transmis par e-mail." },
      accepte: { l: "Devis accepté", d: "Votre course est planifiée, à très bientôt." },
      refuse: { l: "Demande close", d: "Cette demande a été clôturée. Contactez-nous pour en créer une nouvelle." },
    },
    trajet: "Trajet",
    quand: "Date souhaitée",
    vehicule: "Véhicule",
    passagers: "Passagers",
    allerRetour: "Aller-retour",
    estimation: "Estimation indicative",
    propose: "Prix proposé",
    reponse: "Message des chauffeurs",
    created: "Demande déposée le",
    newQuote: "Faire une nouvelle demande de devis",
    yes: "Oui",
    no: "Non",
  },
  en: {
    eyebrow: "Request tracking",
    h1: "Track my quote request",
    lead: "Enter the reference number you received by email and the email address used for the request.",
    ref: "Reference number",
    email: "Email",
    submit: "Check my request",
    loading: "Searching…",
    notFound: "No request matches this reference and email.",
    error: "The search failed. Please try again.",
    statutTitle: "Status of your request",
    statuts: {
      recu: { l: "Request received", d: "Your request is registered and being reviewed by our drivers." },
      en_cours: { l: "Being reviewed", d: "Alain and Patricia are working out your firm price." },
      devis_envoye: { l: "Quote sent", d: "Your quote has been emailed to you." },
      accepte: { l: "Quote accepted", d: "Your ride is scheduled, see you soon." },
      refuse: { l: "Request closed", d: "This request has been closed. Contact us to start a new one." },
    },
    trajet: "Journey",
    quand: "Preferred date",
    vehicule: "Vehicle",
    passagers: "Passengers",
    allerRetour: "Return trip",
    estimation: "Indicative estimate",
    propose: "Quoted price",
    reponse: "Message from your drivers",
    created: "Request submitted on",
    newQuote: "Send a new quote request",
    yes: "Yes",
    no: "No",
  },
} as const;

type Devis = {
  reference: string;
  statut: string;
  created_at: string;
  depart: string;
  arrivee: string;
  date_souhaitee: string | null;
  heure_souhaitee: string | null;
  vehicule: string | null;
  passagers: number;
  aller_retour: boolean;
  prix_estime: number | null;
  prix_propose: number | null;
  reponse: string | null;
};

function SuiviDevisPage() {
  const { lang } = useI18n();
  const isEn = lang === "en";
  const c = isEn ? COPY.en : COPY.fr;
  const search = useSearch({ from: "/devis/suivi" });
  const lookup = useServerFn(getDevisStatus);

  const [reference, setReference] = useState(search.ref ?? "");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "found" | "notfound" | "error">("idle");
  const [devis, setDevis] = useState<Devis | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await lookup({ data: { reference, email } });
      if (res.devis) {
        setDevis(res.devis as Devis);
        setState("found");
      } else {
        setDevis(null);
        setState("notfound");
      }
    } catch {
      setState("error");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary";
  const statut = devis
    ? (c.statuts as Record<string, { l: string; d: string }>)[devis.statut] ?? c.statuts.recu
    : null;
  const fmtEUR = (v: number) =>
    new Intl.NumberFormat(isEn ? "en-GB" : "fr-FR", { style: "currency", currency: "EUR" }).format(v);
  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(isEn ? "en-GB" : "fr-FR", { dateStyle: "long" }).format(new Date(iso));

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{c.h1}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.lead}</p>

      <form onSubmit={onSubmit} className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{c.ref}</span>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value.toUpperCase())}
            required
            maxLength={20}
            placeholder="APT-XXXXXX"
            className={`${inputCls} mt-1.5 tracking-[0.12em]`}
          />
        </label>
        <label className="mt-3 block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{c.email}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
            className={`${inputCls} mt-1.5`}
          />
        </label>
        <button
          type="submit"
          disabled={state === "loading"}
          className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90 disabled:opacity-60"
        >
          {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
          {state === "loading" ? c.loading : c.submit}
        </button>

        {state === "notfound" && (
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-destructive">
            <XCircle className="h-4 w-4" /> {c.notFound}
          </p>
        )}
        {state === "error" && <p className="mt-3 text-sm font-medium text-destructive">{c.error}</p>}
      </form>

      {state === "found" && devis && statut && (
        <section className="mt-8 rounded-2xl border border-primary/40 bg-card p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{c.statutTitle}</p>
          <h2 className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold text-primary">
            {devis.statut === "accepte" ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <Clock className="h-6 w-6" />
            )}
            {statut.l}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{statut.d}</p>

          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <Item label={c.trajet} value={`${devis.depart} → ${devis.arrivee}`} />
            <Item
              label={c.quand}
              value={
                devis.date_souhaitee
                  ? `${fmtDate(devis.date_souhaitee)}${devis.heure_souhaitee ? ` — ${devis.heure_souhaitee}` : ""}`
                  : "—"
              }
            />
            <Item label={c.vehicule} value={devis.vehicule ?? "—"} />
            <Item label={c.passagers} value={String(devis.passagers)} />
            <Item label={c.allerRetour} value={devis.aller_retour ? c.yes : c.no} />
            {devis.prix_estime != null && <Item label={c.estimation} value={`≈ ${fmtEUR(devis.prix_estime)}`} />}
            {devis.prix_propose != null && <Item label={c.propose} value={fmtEUR(devis.prix_propose)} />}
            <Item label={c.created} value={fmtDate(devis.created_at)} />
          </dl>

          {devis.reponse && (
            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{c.reponse}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{devis.reponse}</p>
            </div>
          )}
        </section>
      )}

      <Link to="/devis" className="mt-8 inline-block text-sm font-semibold text-primary underline">
        {c.newQuote} →
      </Link>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 px-4 py-3">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}
