import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  nom?: string
  reference?: string
  depart?: string
  arrivee?: string
  quand?: string
  vehicule?: string
  passagers?: string
  estimation?: string
  suiviUrl?: string
  lang?: string
}

const L = (lang?: string) => (lang === 'en' ? EN : FR)

const FR = {
  preview: (r: string) => `Votre demande de devis ${r} est bien reçue`,
  h1: 'Demande de devis reçue',
  lead: (n: string) =>
    `Bonjour ${n}, nous avons bien reçu votre demande de devis. Alain et Patricia vous répondent dans les meilleurs délais avec un prix ferme.`,
  refLabel: 'Votre numéro de référence',
  recap: 'Récapitulatif de votre demande',
  depart: 'Départ',
  arrivee: 'Arrivée',
  quand: 'Date souhaitée',
  vehicule: 'Véhicule',
  passagers: 'Passagers',
  estimation: 'Estimation indicative',
  track: 'Suivre ma demande :',
  footer: "Conservez ce numéro de référence : il vous permet de consulter l'état de votre demande à tout moment.",
}

const EN = {
  preview: (r: string) => `Your quote request ${r} has been received`,
  h1: 'Quote request received',
  lead: (n: string) =>
    `Hello ${n}, we have received your quote request. Alain and Patricia will reply shortly with a firm price.`,
  refLabel: 'Your reference number',
  recap: 'Summary of your request',
  depart: 'Pickup',
  arrivee: 'Drop-off',
  quand: 'Preferred date',
  vehicule: 'Vehicle',
  passagers: 'Passengers',
  estimation: 'Indicative estimate',
  track: 'Track my request:',
  footer: 'Keep this reference number: it lets you check the status of your request at any time.',
}

const DevisConfirmationEmail = (p: Props) => {
  const t = L(p.lang)
  const ref = p.reference ?? '—'
  return (
    <Html lang={p.lang === 'en' ? 'en' : 'fr'} dir="ltr">
      <Head />
      <Preview>{t.preview(ref)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>ACCESS PRESTIGE TAXI</Text>
          <Heading style={h1}>{t.h1}</Heading>
          <Text style={lead}>{t.lead(p.nom ?? '')}</Text>

          <Section style={refBox}>
            <Text style={refLabel}>{t.refLabel}</Text>
            <Text style={refValue}>{ref}</Text>
          </Section>

          <Section style={card}>
            <Text style={cardTitle}>{t.recap}</Text>
            <Row label={t.depart} value={p.depart} />
            <Row label={t.arrivee} value={p.arrivee} />
            <Row label={t.quand} value={p.quand} />
            <Row label={t.vehicule} value={p.vehicule} />
            <Row label={t.passagers} value={p.passagers} />
            {p.estimation ? <Row label={t.estimation} value={p.estimation} /> : null}
          </Section>

          {p.suiviUrl ? (
            <Text style={lead}>
              {t.track} <a href={p.suiviUrl} style={link}>{p.suiviUrl}</a>
            </Text>
          ) : null}

          <Hr style={hr} />
          <Text style={footer}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  )
}

const Row = ({ label, value }: { label: string; value?: string }) => (
  <Text style={row}>
    <span style={rowLabel}>{label} : </span>
    <span style={rowValue}>{value || '—'}</span>
  </Text>
)

export const template = {
  component: DevisConfirmationEmail,
  subject: (d: Record<string, any>) =>
    d?.lang === 'en'
      ? `Quote request received — ${d?.reference ?? ''}`
      : `Demande de devis reçue — ${d?.reference ?? ''}`,
  displayName: 'Confirmation de demande de devis',
  previewData: {
    nom: 'Marie Dupont',
    reference: 'APT-7F3K9Q',
    depart: 'La Rochelle, gare SNCF',
    arrivee: 'Royan, Pontaillac',
    quand: '12/09/2026 à 09:30',
    vehicule: 'BMW iX1 100 % électrique — 5 places',
    passagers: '3',
    estimation: '≈ 118,40 €',
    suiviUrl: 'https://www.accessprestigetaxi.fr/devis/suivi',
    lang: 'fr',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }
const container = { padding: '28px', maxWidth: '560px' }
const brand = { fontSize: '13px', letterSpacing: '0.26em', color: '#C6A24A', fontWeight: 700 as const, margin: '0 0 12px' }
const h1 = { fontSize: '23px', fontWeight: 'bold' as const, color: '#0B0B0D', margin: '0 0 12px' }
const lead = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 18px' }
const refBox = { background: '#0B0B0D', borderRadius: '10px', padding: '16px 18px', margin: '0 0 18px' }
const refLabel = { fontSize: '11px', letterSpacing: '0.2em', color: '#C6A24A', textTransform: 'uppercase' as const, margin: '0 0 6px' }
const refValue = { fontSize: '24px', fontWeight: 700 as const, color: '#ffffff', letterSpacing: '0.08em', margin: 0 }
const card = { background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px 18px' }
const cardTitle = { fontSize: '13px', fontWeight: 700 as const, color: '#0B0B0D', margin: '0 0 8px' }
const row = { fontSize: '14px', color: '#222', margin: '6px 0', lineHeight: '1.5' }
const rowLabel = { color: '#666', fontWeight: 600 }
const rowValue = { color: '#111' }
const link = { color: '#C6A24A' }
const hr = { borderColor: '#e5e5e5', margin: '18px 0' }
const footer = { fontSize: '12px', color: '#999', margin: 0 }
