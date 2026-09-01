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

type Lang = "fr" | "en";

interface Props {
  lang?: Lang;
  nom?: string;
  depart?: string;
  arrivee?: string;
  pickup_datetime?: string;
  distance_km?: string;
  prix?: string;
  reservation_id?: string;
  suivi_url?: string;
}

const UI: Record<Lang, Record<string, string>> = {
  fr: {
    title: "Votre facture de course",
    hi: "Bonjour",
    lead: "Votre course est terminée. Voici le récapitulatif et le montant final relevé au compteur.",
    from: "Départ",
    to: "Arrivée",
    when: "Date / heure",
    dist: "Distance",
    total: "Montant total",
    ref: "N° de course",
    cta: "Voir ma course et ma facture",
    link: "Lien :",
    foot: "Access Prestige Taxi — Charente-Maritime · Transport sanitaire · Toutes distances",
  },
  en: {
    title: "Your ride invoice",
    hi: "Hello",
    lead: "Your ride is complete. Here is the summary and the final metered amount.",
    from: "From",
    to: "To",
    when: "Date / time",
    dist: "Distance",
    total: "Total amount",
    ref: "Ride number",
    cta: "View my ride and invoice",
    link: "Link:",
    foot: "Access Prestige Taxi — Charente-Maritime · Medical transport · All distances",
  },
};

function fmtDate(iso?: string, lang: Lang = "fr"): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(lang === "en" ? "en-GB" : "fr-FR", {
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
  const u = UI[lang];
  const ref = p.reservation_id ? `APT-${p.reservation_id.slice(0, 8).toUpperCase()}` : "";
  const suivi = p.suivi_url || "https://www.accessprestigetaxi.fr";

  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{u.title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>ACCESS PRESTIGE TAXI</Text>
          <Heading style={h1}>{u.title}</Heading>
          <Text style={lead}>
            {u.hi} {p.nom ?? ""},
          </Text>
          <Text style={lead}>{u.lead}</Text>

          <Section style={card}>
            <Row label={u.from} value={p.depart} />
            <Row label={u.to} value={p.arrivee} />
            {p.pickup_datetime ? <Row label={u.when} value={fmtDate(p.pickup_datetime, lang)} /> : null}
            {p.distance_km ? <Row label={u.dist} value={p.distance_km} /> : null}
            {ref ? <Row label={u.ref} value={ref} /> : null}
            <Hr style={hr} />
            <Text style={totalRow}>
              <span style={rowLabel}>{u.total} : </span>
              <span style={totalValue}>{p.prix || "—"}</span>
            </Text>
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

const main = { backgroundColor: "#05090d", margin: 0, padding: "24px 0", fontFamily: "Arial, sans-serif" };
const container = { backgroundColor: "#07111f", borderRadius: 16, padding: "28px 24px", maxWidth: 560 };
const brand = { color: "#e0b866", fontSize: 12, letterSpacing: 2, margin: 0, fontWeight: 700 };
const h1 = { color: "#ffffff", fontSize: 22, margin: "10px 0 16px" };
const lead = { color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: "22px", margin: "0 0 10px" };
const card = { backgroundColor: "#05090d", borderRadius: 12, padding: "16px 18px", marginTop: 12 };
const row = { margin: "4px 0", fontSize: 13 };
const rowLabel = { color: "rgba(255,255,255,0.55)" };
const rowValue = { color: "#ffffff", fontWeight: 600 };
const totalRow = { margin: "6px 0 0", fontSize: 15 };
const totalValue = { color: "#e0b866", fontWeight: 800, fontSize: 18 };
const hr = { borderColor: "rgba(224,184,102,0.35)", margin: "12px 0" };
const btn = {
  backgroundColor: "#e0b866",
  color: "#05090d",
  borderRadius: 10,
  padding: "12px 20px",
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
};
const linkText = { color: "rgba(255,255,255,0.55)", fontSize: 12, textAlign: "center" as const };
const linkStyle = { color: "#e0b866" };
const footer = { color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 22, textAlign: "center" as const };

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    d?.lang === "en" ? "Your ride invoice — Access Prestige Taxi" : "Votre facture de course — Access Prestige Taxi",
  displayName: "Facture de course",
  previewData: {
    lang: "fr",
    nom: "Marie",
    depart: "La Rochelle",
    arrivee: "Royan",
    pickup_datetime: new Date().toISOString(),
    distance_km: "72 km",
    prix: "128,00 €",
    reservation_id: "0f7a1c22-2f2f-4b6a-9f5e-1a2b3c4d5e6f",
    suivi_url: "https://www.accessprestigetaxi.fr/suivi/abc123",
  },
};
