import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useI18n } from "@/i18n/I18nProvider";
import { submitDevis } from "@/lib/devis.functions";

const COPY = {
  fr: {
    title: "Votre demande de devis",
    sub: "Réponse par e-mail dans les meilleurs délais. Champs marqués * obligatoires.",
    nom: "Nom et prénom *",
    email: "E-mail *",
    tel: "Téléphone *",
    depart: "Adresse de départ *",
    arrivee: "Adresse d'arrivée *",
    date: "Date souhaitée *",
    heure: "Heure souhaitée *",
    aller: "Aller-retour",
    passagers: "Nombre de passagers",
    bagages: "Nombre de bagages",
    vehicule: "Véhicule souhaité",
    vehicules: [
      { v: "indifferent", l: "Indifférent (au choix des chauffeurs)" },
      { v: "bmw", l: "BMW iX1 100 % électrique — 5 places" },
      { v: "audi", l: "Audi Q6 e-tron électrique — 5 places" },
      { v: "van", l: "Van Mercedes classe V — 8 places" },
    ],
    prestation: "Type de prestation",
    prestations: [
      { v: "transfert", l: "Transfert gare ou aéroport" },
      { v: "sanitaire", l: "Transport sanitaire conventionné" },
      { v: "groupe", l: "Transport de groupe" },
      { v: "mise-a-dispo", l: "Mise à disposition avec chauffeur" },
      { v: "longue-distance", l: "Longue distance" },
      { v: "autre", l: "Autre" },
    ],
    sanitaireTitle: "Transport sanitaire",
    sanitaire: "Transport sanitaire conventionné (sur prescription)",
    fauteuil: "Transport avec fauteuil roulant",
    groupeTitle: "Transport de groupe",
    groupe: "Transport de groupe (jusqu'à 8 personnes)",
    bagagesVol: "Bagages volumineux (valises, matériel, poussettes)",
    sieges: "Siège bébé ou rehausseur enfant",
    message: "Précisions (facultatif)",
    placeholder: "Numéro de vol ou de train, étapes, horaires de retour, besoins particuliers…",
    send: "Envoyer ma demande de devis",
    sending: "Envoi…",
    ok: "Demande envoyée ! Nous revenons vers vous très vite avec votre devis.",
    err: "L'envoi a échoué. Merci de réessayer ou de nous appeler.",
    yes: "Oui",
    subject: "Demande de devis",
    refLabel: "Votre numéro de référence",
    trackCta: "Suivre ma demande",
  },
  en: {
    title: "Your quote request",
    sub: "We reply by email as quickly as possible. Fields marked * are required.",
    nom: "Full name *",
    email: "Email *",
    tel: "Phone *",
    depart: "Pickup address *",
    arrivee: "Drop-off address *",
    date: "Preferred date *",
    heure: "Preferred time *",
    aller: "Return trip",
    passagers: "Number of passengers",
    bagages: "Number of bags",
    vehicule: "Preferred vehicle",
    vehicules: [
      { v: "indifferent", l: "No preference (drivers decide)" },
      { v: "bmw", l: "BMW iX1 fully electric — 5 seats" },
      { v: "audi", l: "Audi Q6 e-tron electric — 5 seats" },
      { v: "van", l: "Mercedes V-Class van — 8 seats" },
    ],
    prestation: "Type of service",
    prestations: [
      { v: "transfert", l: "Station or airport transfer" },
      { v: "sanitaire", l: "Covered medical transport" },
      { v: "groupe", l: "Group transport" },
      { v: "mise-a-dispo", l: "Chauffeur hire" },
      { v: "longue-distance", l: "Long distance" },
      { v: "autre", l: "Other" },
    ],
    sanitaireTitle: "Medical transport",
    sanitaire: "Covered medical transport (with prescription)",
    fauteuil: "Wheelchair transport",
    groupeTitle: "Group transport",
    groupe: "Group transport (up to 8 people)",
    bagagesVol: "Bulky luggage (suitcases, equipment, pushchairs)",
    sieges: "Baby or booster seat",
    message: "Additional details (optional)",
    placeholder: "Flight or train number, stops, return times, special requirements…",
    send: "Send my quote request",
    sending: "Sending…",
    ok: "Request sent! We'll get back to you shortly with your quote.",
    err: "Sending failed. Please try again or call us.",
    yes: "Yes",
    subject: "Quote request",
    refLabel: "Your reference number",
    trackCta: "Track my request",
  },
} as const;

export type QuotePrefill = {
  prestation?: string;
  depart?: string;
  arrivee?: string;
  date?: string;
  heure?: string;
  allerRetour?: boolean;
  passagers?: number;
  vehicule?: string;
  distanceKm?: number | null;
  prix?: number | null;
};

export function QuoteForm({ prefill, formRef }: { prefill?: QuotePrefill; formRef?: React.Ref<HTMLFormElement> }) {
  const { lang } = useI18n();
  const isEn = lang === "en";
  const c = isEn ? COPY.en : COPY.fr;
  const submit = useServerFn(submitDevis);
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [sanitaire, setSanitaire] = useState(false);
  const [groupe, setGroupe] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const presetPrestation =
    c.prestations.find((p) => p.v === prefill?.prestation)?.l ?? c.prestations[0].l;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const g = (k: string) => String(fd.get(k) ?? "").trim();
    const num = (k: string, d: number) => {
      const v = Number(fd.get(k));
      return Number.isFinite(v) && v >= 0 ? v : d;
    };

    setState("sending");
    try {
      const res = await submit({
        data: {
          nom: g("nom"),
          email: g("email"),
          telephone: g("telephone") || null,
          depart: g("depart"),
          arrivee: g("arrivee"),
          date_souhaitee: g("date") || null,
          heure_souhaitee: g("heure") || null,
          aller_retour: !!fd.get("aller_retour"),
          passagers: Math.min(8, Math.max(1, Math.round(num("passagers", 1)))),
          bagages: Math.min(20, Math.round(num("bagages", 0))),
          vehicule: g("vehicule") || null,
          prestation: g("prestation") || null,
          transport_sanitaire: !!fd.get("sanitaire"),
          fauteuil_roulant: !!fd.get("fauteuil"),
          transport_groupe: !!fd.get("groupe"),
          sieges_enfant: !!fd.get("sieges"),
          distance_km: prefill?.distanceKm ?? null,
          prix_estime: prefill?.prix ?? null,
          precisions: g("precisions") || null,
          langue: isEn ? "en" : "fr",
        },
      });
      setReference(res.reference);
      setState("ok");
      form.reset();
      setSanitaire(false);
      setGroupe(false);
    } catch {
      setState("error");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-[#d6a83d]/45 bg-[#07101a] px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-primary";
  const labelCls = "text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70";

  if (state === "ok") {
    return (
      <div className="rounded-2xl border border-[#d6a83d]/45 bg-[linear-gradient(145deg,#111b26,#07101a)] p-8 text-center text-white">
        <CheckCircle2 className="mx-auto h-9 w-9 text-primary" />
        <p className="mt-3 font-display text-lg font-semibold">{c.ok}</p>
        {reference && (
          <>
            <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/70">{c.refLabel}</p>
            <p className="mt-1 font-display text-2xl font-semibold tracking-[0.12em] text-primary">{reference}</p>
            <Link
              to="/devis/suivi"
              search={{ ref: reference }}
              className="mt-5 inline-block text-sm font-semibold text-primary underline"
            >
              {c.trackCta} →
            </Link>
          </>
        )}
      </div>
    );
  }


  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="rounded-2xl border border-[#d6a83d]/45 bg-[linear-gradient(145deg,#111b26,#07101a)] p-5 text-white sm:p-7"
    >
      <h2 className="font-display text-xl font-semibold text-[#f4efe5] sm:text-2xl">{c.title}</h2>
      <p className="mt-1 text-sm text-white/70">{c.sub}</p>


      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Field label={c.nom} className={labelCls}>
          <input name="nom" required minLength={2} maxLength={100} className={inputCls} />
        </Field>
        <Field label={c.email} className={labelCls}>
          <input name="email" type="email" required maxLength={255} className={inputCls} />
        </Field>
        <Field label={c.tel} className={labelCls}>
          <input name="telephone" type="tel" required maxLength={30} className={inputCls} />
        </Field>
        <Field label={c.prestation} className={labelCls}>
          <select
            name="prestation"
            className={inputCls}
            key={`pr-${presetPrestation}`}
            defaultValue={presetPrestation}
          >
            {c.prestations.map((p) => (
              <option key={p.v} value={p.l}>
                {p.l}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.depart} className={labelCls}>
          <input name="depart" required maxLength={160} defaultValue={prefill?.depart ?? ""} key={`dep-${prefill?.depart ?? ""}`} className={inputCls} />
        </Field>
        <Field label={c.arrivee} className={labelCls}>
          <input name="arrivee" required maxLength={160} defaultValue={prefill?.arrivee ?? ""} key={`arr-${prefill?.arrivee ?? ""}`} className={inputCls} />
        </Field>
        <Field label={c.date} className={labelCls}>
          <input name="date" type="date" required defaultValue={prefill?.date ?? ""} key={`d-${prefill?.date ?? ""}`} className={inputCls} />
        </Field>
        <Field label={c.heure} className={labelCls}>
          <input name="heure" type="time" required defaultValue={prefill?.heure ?? ""} key={`h-${prefill?.heure ?? ""}`} className={inputCls} />
        </Field>
        <Field label={c.passagers} className={labelCls}>
          <input name="passagers" type="number" min={1} max={8} defaultValue={prefill?.passagers ?? 1} key={`p-${prefill?.passagers ?? 1}`} className={inputCls} />
        </Field>
        <Field label={c.bagages} className={labelCls}>
          <input name="bagages" type="number" min={0} max={20} defaultValue={0} className={inputCls} />
        </Field>
        <Field label={c.vehicule} className={`${labelCls} sm:col-span-2`}>
          <select name="vehicule" className={inputCls} key={`v-${prefill?.vehicule ?? ""}`} defaultValue={prefill?.vehicule ?? c.vehicules[0].l}>
            {c.vehicules.map((v) => (
              <option key={v.v} value={v.l}>
                {v.l}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset className="mt-6 rounded-xl border border-border p-4">
        <legend className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          {c.sanitaireTitle}
        </legend>
        <Check2 name="sanitaire" label={c.sanitaire} checked={sanitaire} onChange={setSanitaire} />
        {sanitaire && <Check2 name="fauteuil" label={c.fauteuil} />}
      </fieldset>

      <fieldset className="mt-4 rounded-xl border border-border p-4">
        <legend className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          {c.groupeTitle}
        </legend>
        <Check2 name="groupe" label={c.groupe} checked={groupe} onChange={setGroupe} />
        {groupe && <Check2 name="bagages_volumineux" label={c.bagagesVol} />}
        <Check2 name="sieges" label={c.sieges} />
        <Check2 name="aller_retour" label={c.aller} key={`ar-${prefill?.allerRetour ? 1 : 0}`} defaultChecked={prefill?.allerRetour} />
      </fieldset>

      <label className="mt-4 block">
        <span className={labelCls}>{c.message}</span>
        <textarea
          name="precisions"
          maxLength={1500}
          rows={4}
          placeholder={c.placeholder}
          className={`${inputCls} mt-1.5 resize-y`}
        />
      </label>

      {state === "error" && <p className="mt-3 text-sm font-medium text-destructive">{c.err}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90 disabled:opacity-60"
      >
        {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {state === "sending" ? c.sending : c.send}
      </button>
    </form>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className?.includes("col-span") ? "block sm:col-span-2" : "block"}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Check2({
  name,
  label,
  checked,
  defaultChecked,
  onChange,
}: {
  name: string;
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="mt-2 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm text-foreground">
      <input
        type="checkbox"
        name={name}
        checked={onChange ? checked : undefined}
        defaultChecked={onChange ? undefined : defaultChecked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        className="h-4 w-4 accent-[hsl(var(--primary))]"
      />
      {label}
    </label>
  );
}
