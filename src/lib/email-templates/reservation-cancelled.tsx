import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

type Lang = "fr" | "en";

interface Props {
  lang?: Lang;
  nom?: string;
  pickup_datetime?: string;
  depart?: string;
  arrivee?: string;
  reservation_id?: string;
  reason?: string;
  rebook_url?: string;
}

const STR: Record<Lang, Record<string, string>> = {
  fr: {
    preview: "Votre réservation a bien été annulée",
    title: "Réservation annulée",
    hi: "Bonjour",
    intro:
      "Votre réservation a bien été annulée. Aucun frais ne vous sera facturé. Nous restons à votre disposition pour un prochain trajet.",
    when: "Date / heure prévue",
    from: "Départ",
    to: "Arrivée",
    ref: "N° de réservation",
    reason: "Motif",
    cta: "Réserver un nouveau trajet",
    foot: "Access Prestige Taxi — Charente-Maritime · Transport sanitaire · Toutes distances",
    subj: "Annulation de votre réservation — Access Prestige Taxi",
  },
  en: {
    preview: "Your booking has been cancelled",
    title: "Booking cancelled",
    hi: "Hello",
    intro:
      "Your booking has been cancelled. You will not be charged. We remain at your service for your next ride.",
    when: "Scheduled date / time",
    from: "From",
    to: "To",
    ref: "Booking number",
    reason: "Reason",
    cta: "Book a new ride",
    foot: "Access Prestige Taxi — Charente-Maritime · Medical transport · All distances",
    subj: "Your booking has been cancelled — Access Prestige Taxi",
  },
};

function fmtDate(iso?: string, lang: Lang = "fr"): string {
  if (!iso) return "—";
  const locale = lang === "en" ? "en-GB" : "fr-FR";
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [y, m, d] = iso.split("-").map(Number);
      return new Date(y, m - 1, d).toLocaleDateString(locale, { dateStyle: "full" });
    }
    return new Date(iso).toLocaleString(locale, {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    });
  } catch {
    return iso;
  }
}

const Row = ({ label, value }: { label: string; value?: string }) => (
  <Text style={row}>
    <span style={rowLabel}>{label} : </span>
    <span style={rowValue}>{value || "—"}</span>
  </Text>
);

const Email = (p: Props) => {
  const lang: Lang = p.lang && STR[p.lang] ? p.lang : "fr";
  const s = STR[lang];
  const ref = p.reservation_id ? `APT-${p.reservation_id.slice(0, 8).toUpperCase()}` : "";
  const rebook = p.rebook_url || "https://accessprestigetaxi.fr/reserver";

  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{s.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>ACCESS PRESTIGE TAXI</Text>
          <Heading style={h1}>{s.title}</Heading>
          <Text style={lead}>
            {s.hi} {p.nom ?? ""},
          </Text>
          <Text style={lead}>{s.intro}</Text>

          <Section style={card}>
            <Row label={s.when} value={fmtDate(p.pickup_datetime, lang)} />
            <Row label={s.from} value={p.depart} />
            <Row label={s.to} value={p.arrivee} />
            <Hr style={hr} />
            {ref ? <Row label={s.ref} value={ref} /> : null}
            {p.reason ? <Row label={s.reason} value={p.reason} /> : null}
          </Section>

          <Section style={{ textAlign: "center", margin: "28px 0 8px" }}>
            <Button href={rebook} style={btn}>
              {s.cta}
            </Button>
          </Section>

          <Text style={footer}>{s.foot}</Text>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => {
    const l: Lang = d?.lang === "en" ? "en" : "fr";
    return STR[l].subj;
  },
  displayName: "Annulation réservation (FR/EN)",
  previewData: {
    lang: "fr",
    nom: "Jean Dupont",
    pickup_datetime: "2026-05-10T14:30:00+00:00",
    depart: "La Rochelle",
    arrivee: "Rochefort",
    reservation_id: "abcdef12-0000-0000-0000-000000000000",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, Helvetica, sans-serif" };
const container = { padding: "28px 24px", maxWidth: "560px" };
const brand = {
  fontSize: "12px",
  letterSpacing: "0.22em",
  fontWeight: 700 as const,
  color: "#C6A24A",
  margin: "0 0 10px",
};
const h1 = { fontSize: "23px", fontWeight: 700 as const, color: "#0B0B0D", margin: "0 0 16px" };
const lead = { fontSize: "14px", color: "#444", lineHeight: "1.6", margin: "0 0 14px" };
const card = { background: "#faf7f0", border: "1px solid #e8e0cd", borderRadius: "10px", padding: "16px 18px" };
const row = { fontSize: "14px", color: "#222", margin: "6px 0", lineHeight: "1.5" };
const rowLabel = { color: "#6b7280", fontWeight: 600 as const };
const rowValue = { color: "#111" };
const hr = { borderColor: "#e8e0cd", margin: "12px 0" };
const btn = {
  backgroundColor: "#C6A24A",
  borderRadius: "10px",
  color: "#0B0B0D",
  fontSize: "15px",
  fontWeight: "700",
  padding: "14px 26px",
  textDecoration: "none",
  display: "inline-block",
};
const footer = { fontSize: "12px", color: "#9ca3af", margin: "22px 0 0", lineHeight: "1.6" };
