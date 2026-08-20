import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  reference?: string
  nom?: string
  email?: string
  telephone?: string
  depart?: string
  arrivee?: string
  quand?: string
  vehicule?: string
  prestation?: string
  passagers?: string
  bagages?: string
  options?: string
  estimation?: string
  precisions?: string
  lang?: string
}

const DevisAdminEmail = (p: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Nouvelle demande de devis {p.reference ?? ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nouvelle demande de devis</Heading>
        <Text style={lead}>
          Référence <strong>{p.reference ?? '—'}</strong> — langue du client : {p.lang === 'en' ? 'anglais' : 'français'}.
        </Text>

        <Section style={card}>
          <Row label="Client" value={p.nom} />
          <Row label="Email" value={p.email} />
          <Row label="Téléphone" value={p.telephone} />
          <Hr style={hr} />
          <Row label="Départ" value={p.depart} />
          <Row label="Arrivée" value={p.arrivee} />
          <Row label="Date souhaitée" value={p.quand} />
          <Row label="Prestation" value={p.prestation} />
          <Row label="Véhicule" value={p.vehicule} />
          <Row label="Passagers" value={p.passagers} />
          <Row label="Bagages" value={p.bagages} />
          <Row label="Options" value={p.options} />
          <Row label="Estimation" value={p.estimation} />
          <Hr style={hr} />
          <Text style={messageLabel}>Précisions :</Text>
          <Text style={messageBody}>{p.precisions || '—'}</Text>
        </Section>

        <Text style={footer}>Répondez directement à {p.email ?? 'ce client'} pour envoyer le devis.</Text>
      </Container>
    </Body>
  </Html>
)

const Row = ({ label, value }: { label: string; value?: string }) => (
  <Text style={row}>
    <span style={rowLabel}>{label} : </span>
    <span style={rowValue}>{value || '—'}</span>
  </Text>
)

export const template = {
  component: DevisAdminEmail,
  subject: (d: Record<string, any>) =>
    `Devis ${d?.reference ?? ''} — ${d?.depart ?? ''} → ${d?.arrivee ?? ''}`,
  displayName: 'Nouvelle demande de devis (chauffeurs)',
  to: 'accessprestigetaxi@gmail.com',
  previewData: {
    reference: 'APT-7F3K9Q',
    nom: 'Marie Dupont',
    email: 'marie@example.com',
    telephone: '06 12 34 56 78',
    depart: 'La Rochelle, gare SNCF',
    arrivee: 'Royan, Pontaillac',
    quand: '12/09/2026 à 09:30',
    vehicule: 'Van Mercedes classe V — 8 places',
    prestation: 'Transport de groupe',
    passagers: '7',
    bagages: '6',
    options: 'Aller-retour, sièges enfant',
    estimation: '≈ 118,40 € (72 km)',
    precisions: 'Retour prévu vers 18h.',
    lang: 'fr',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0B0B0D', margin: '0 0 12px' }
const lead = { fontSize: '14px', color: '#55575d', lineHeight: '1.5', margin: '0 0 20px' }
const card = { background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px 18px' }
const row = { fontSize: '14px', color: '#222', margin: '6px 0', lineHeight: '1.5' }
const rowLabel = { color: '#666', fontWeight: 600 }
const rowValue = { color: '#111' }
const hr = { borderColor: '#e5e5e5', margin: '12px 0' }
const messageLabel = { fontSize: '13px', fontWeight: 600 as const, color: '#666', margin: '4px 0' }
const messageBody = { fontSize: '14px', color: '#111', lineHeight: '1.6', whiteSpace: 'pre-wrap' as const, margin: '0' }
const footer = { fontSize: '12px', color: '#999', margin: '20px 0 0' }
