import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

type Lang = "fr" | "en";
type Stage = "accepted" | "en_route" | "arrived" | "completed";

interface Props {
  lang?: Lang;
  stage?: Stage;
  nom?: string;
  depart?: string;
  arrivee?: string;
  pickup_datetime?: string;
  driver_name?: string;
  eta_minutes?: number | string;
  reservation_id?: string;
  suivi_url?: string;
}

const STAGE_FR: Record<Stage, { title: string; body: string; subj: string }> = {
  accepted: {
    title: "Votre course est confirmée",
    body: "Votre chauffeur a accepté la course. Vous pouvez suivre son approche en temps réel dès son départ.",
    subj: "Course confirmée — suivez votre chauffeur",
  },
  en_route: {
    title: "Votre chauffeur est en route",
    body: "Votre chauffeur vient de partir vers votre point de prise en charge. Suivez sa position en direct.",
    subj: "Votre chauffeur est en route — suivi en direct",
  },
  arrived: {
    title: "Votre chauffeur est arrivé",
    body: "Votre chauffeur vous attend au point de prise en charge. Bon trajet !",
    subj: "Votre chauffeur est arrivé",
  },
  completed: {
    title: "Merci pour votre trajet",
    body: "Votre course est terminée. Retrouvez le récapitulatif et votre reçu depuis le lien ci-dessous.",
    subj: "Course terminée — votre récapitulatif",
  },
};

const STAGE_EN: Record<Stage, { title: string; body: string; subj: string }> = {
  accepted: {
    title: "Your ride is confirmed",
    body: "Your driver has accepted the ride. You can follow the approach live once they set off.",
    subj: "Ride confirmed — track your driver",
  },
  en_route: {
    title: "Your driver is on the way",
    body: "Your driver has just left for your pickup point. Follow their position live.",
    subj: "Your driver is on the way — live tracking",
  },
  arrived: {
    title: "Your driver has arrived",
    body: "Your driver is waiting at the pickup point. Enjoy your ride!",
    subj: "Your driver has arrived",
  },
  completed: {
    title: "Thank you for riding with us",
    body: "Your ride is complete. You can find the summary and your receipt via the link below.",
    subj: "Ride completed — your summary",
  },
};

const UI: Record<Lang, Record<string, string>> = {
  fr: {
    hi: "Bonjour",
    from: "Départ",
    to: "Arrivée",
    when: "Date / heure",
    driver: "Chauffeur",
    eta: "Arrivée estimée",
    ref: "N° de réservation",
    cta: "Suivre ma course en temps réel",
    link: "Lien de suivi :",
    foot: "Access Prestige Taxi — Charente-Maritime · Transport sanitaire · Toutes distances",
    min: "min",
  },
  en: {
    hi: "Hello",
    from: "From",
    to: "To",
    when: "Date / time",
    driver: "Driver",
    eta: "Estimated arrival",
    ref: "Booking number",
    cta: "Track my ride in real time",
    link: "Tracking link:",
    foot: "Access Prestige Taxi — Charente-Maritime · Medical transport · All distances",
    min: "min",
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
  const lang: Lang = p.lang === "en" ? "en" : "fr";
  const stage: Stage = p.stage && ["accepted", "en_route", "arrived", "completed"].includes(p.stage)
    ? p.stage
    : "en_route";
  const s = (lang === "en" ? STAGE_EN : STAGE_FR)[stage];
  const u = UI[lang];
  const ref = p.reservation_id ? `APT-${p.reservation_id.slice(0, 8).toUpperCase()}` : "";
  const suivi = p.suivi_url || "https://accessprestigetaxi.fr";

  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{s.title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>ACCESS PRESTIGE TAXI</Text>
          <Heading style={h1}>{s.title}</Heading>
          <Text style={lead}>
            {u.hi} {p.nom ?? ""},
          </Text>
          <Text style={lead}>{s.body}</Text>

          <Section style={card}>
            <Row label={u.from} value={p.depart} />
            <Row label={u.to} value={p.arrivee} />
            {p.pickup_datetime ? <Row label={u.when} value={fmtDate(p.pickup_datetime, lang)} /> : null}
            <Hr style={hr} />
            {p.driver_name ? <Row label={u.driver} value={p.driver_name} /> : null}
            {p.eta_minutes ? <Row label={u.eta} value={`~ ${p.eta_minutes} ${u.min}`} /> : null}
            {ref ? <Row label={u.ref} value={ref} /> : null}
          </Section>

          <Section style={{ textAlign: "center", margin: "28px 0 12px" }}>
            <Button href={suivi} style={btn}>
              {u.cta}
            </Button>
          </Section>
          <Text style={linkText}>
            {u.link}{" "}
            <Link href={suivi} style={linkStyle}>
              {suivi}
            </Link>
          </Text>

          <Text style={footer}>{u.foot}</Text>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => {
    const l: Lang = d?.lang === "en" ? "en" : "fr";
    const st: Stage = ["accepted", "en_route", "arrived", "completed"].includes(d?.stage)
      ? (d.stage as Stage)
      : "en_route";
    return `${(l === "en" ? STAGE_EN : STAGE_FR)[st].subj} — Access Prestige Taxi`;
  },
  displayName: "Suivi de course (FR/EN)",
  previewData: {
    lang: "fr",
    stage: "en_route",
    nom: "Jean Dupont",
    depart: "La Rochelle",
    arrivee: "Aéroport de La Rochelle",
    driver_name: "Alain",
    eta_minutes: 8,
    reservation_id: "abcdef12-0000-0000-0000-000000000000",
    suivi_url: "https://accessprestigetaxi.fr/suivi/APT-ABCDEF12",
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
const linkText = { fontSize: "12px", color: "#64748b", margin: "0 0 18px", textAlign: "center" as const };
const linkStyle = { color: "#C6A24A", wordBreak: "break-all" as const };
const footer = { fontSize: "12px", color: "#9ca3af", margin: "22px 0 0", lineHeight: "1.6" };
