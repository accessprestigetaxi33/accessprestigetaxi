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

interface Props {
  lang?: Lang;
  nom?: string;
  pickup_datetime?: string;
  depart?: string;
  arrivee?: string;
  passagers?: number | string;
  bagages?: number | string;
  reservation_id?: string;
  suivi_url?: string;
  unsubscribe_token?: string;
}

const STR: Record<Lang, Record<string, string>> = {
  fr: {
    preview: "Confirmation de votre réservation — votre lien de suivi est ici",
    hi: "Bonjour",
    thanks:
      "Nous avons bien reçu votre demande de réservation. Votre chauffeur vous confirmera la course rapidement, en véhicule 100 % électrique.",
    when: "Date / heure",
    from: "Départ",
    to: "Arrivée",
    pax: "Passagers",
    lug: "Bagages",
    ref: "N° de réservation",
    suivi_btn: "Suivre ma course en temps réel",
    suivi_label: "Lien de suivi :",
    foot: "Accès Prestige Taxi — votre mobilité, notre priorité",
    unsub: "Vous recevez cet email car vous avez effectué une réservation. Ne plus recevoir ces emails",
    subj: "Confirmation de votre réservation — Accès Prestige Taxi",
  },
  en: {
    preview: "Booking confirmation — your tracking link is here",
    hi: "Hello",
    thanks:
      "We've received your booking request. Your driver will confirm your ride shortly, in a 100% electric vehicle.",
    when: "Date / time",
    from: "From",
    to: "To",
    pax: "Passengers",
    lug: "Luggage",
    ref: "Booking number",
    suivi_btn: "Track my ride in real time",
    suivi_label: "Tracking link:",
    foot: "Accès Prestige Taxi — your mobility, our priority",
    unsub: "You're receiving this email because you made a booking. Unsubscribe",
    subj: "Your booking confirmation — Accès Prestige Taxi",
  },
};

function fmtDate(iso?: string, lang: Lang = "fr"): string {
  if (!iso) return "—";
  const LOCALE: Record<Lang, string> = { fr: "fr-FR", en: "en-GB" };
  try {
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
    if (dateOnly) {
      const [y, m, d] = iso.split("-").map(Number);
      return new Date(y, m - 1, d).toLocaleDateString(LOCALE[lang] ?? "fr-FR", { dateStyle: "full" });
    }
    return new Date(iso).toLocaleString(LOCALE[lang] ?? "fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    });
  } catch {
    return iso;
  }
}

const Email = (p: Props) => {
  const lang = p.lang && STR[p.lang] ? p.lang : "fr";
  const s = STR[lang];
  const ref = p.reservation_id ? `APT-${p.reservation_id.slice(0, 8).toUpperCase()}` : "";
  const suiviUrl = p.suivi_url || "https://accesprestigetaxi.fr";

  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{s.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Accès Prestige Taxi</Heading>
          <Text style={lead}>
            {s.hi} {p.nom ?? ""},
          </Text>
          <Text style={lead}>{s.thanks}</Text>

          <Section style={card}>
            <Row label={s.when} value={fmtDate(p.pickup_datetime, lang)} />
            <Row label={s.from} value={p.depart} />
            <Row label={s.to} value={p.arrivee} />
            <Hr style={hr} />
            {p.passagers != null && <Row label={s.pax} value={String(p.passagers)} />}
            {p.bagages != null && <Row label={s.lug} value={String(p.bagages)} />}
            {ref ? <Row label={s.ref} value={ref} /> : null}
          </Section>

          <Section style={{ textAlign: "center", margin: "28px 0 16px" }}>
            <Button href={suiviUrl} style={btnSuivi}>
              {s.suivi_btn}
            </Button>
          </Section>
          <Text style={suiviLinkText}>
            {s.suivi_label}{" "}
            <Link href={suiviUrl} style={suiviLink}>
              {suiviUrl}
            </Link>
          </Text>

          <Text style={footer}>{s.foot}</Text>
          {p.unsubscribe_token ? (
            <Text style={unsubText}>
              <Link href={`https://accesprestigetaxi.fr/unsubscribe?token=${p.unsubscribe_token}`} style={unsubLink}>
                {s.unsub}
              </Link>
            </Text>
          ) : null}
        </Container>
      </Body>
    </Html>
  );
};

const Row = ({ label, value }: { label: string; value?: string }) => (
  <Text style={row}>
    <span style={rowLabel}>{label} : </span>
    <span style={rowValue}>{value || "—"}</span>
  </Text>
);

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => {
    const l = d?.lang && STR[d.lang as Lang] ? (d.lang as Lang) : "fr";
    return STR[l].subj;
  },
  displayName: "Confirmation client réservation",
  previewData: {
    lang: "fr",
    nom: "Jean Dupont",
    pickup_datetime: "2026-05-10T14:30:00+00:00",
    depart: "Bordeaux",
    arrivee: "Aéroport Mérignac",
    passagers: 2,
    bagages: 2,
    reservation_id: "abcdef12-0000-0000-0000-000000000000",
    suivi_url: "https://accesprestigetaxi.fr/suivi/APT-ABCDEF12",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "24px", maxWidth: "560px" };
const h1 = { fontSize: "22px", fontWeight: "bold" as const, color: "#C6A24A", margin: "0 0 12px" };
const lead = { fontSize: "14px", color: "#444", lineHeight: "1.6", margin: "0 0 14px" };
const card = { background: "#fafafa", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "16px 18px" };
const row = { fontSize: "14px", color: "#222", margin: "6px 0", lineHeight: "1.5" };
const rowLabel = { color: "#666", fontWeight: 600 };
const rowValue = { color: "#111" };
const hr = { borderColor: "#e5e5e5", margin: "12px 0" };
const btnSuivi = {
  backgroundColor: "#C6A24A",
  borderRadius: "8px",
  color: "#0B0B0D",
  fontSize: "15px",
  fontWeight: "700",
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
};
const suiviLinkText = { fontSize: "12px", color: "#64748b", margin: "0 0 20px", textAlign: "center" as const };
const suiviLink = { color: "#C6A24A", wordBreak: "break-all" as const };
const footer = { fontSize: "12px", color: "#999", margin: "20px 0 0" };
const unsubText = { fontSize: "11px", color: "#bbb", margin: "8px 0 0", textAlign: "center" as const };
const unsubLink = { color: "#bbb", textDecoration: "underline" };
