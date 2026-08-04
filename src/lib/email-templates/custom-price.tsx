import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from"@react-email/components";
import type { TemplateEntry } from"./registry";
import { BRAND, brandBar, brandTag, button, container, divider, footer, h1, main, text } from"./_brand";

interface Props {
 nom?: string;
 depart?: string;
 arrivee?: string;
 pickup_datetime?: string;
 prix?: string;
 ancien_prix?: string;
 message?: string;
 tracking_url?: string;
}

const Email = (p: Props) => {
 const url = p.tracking_url ||"https://accesprestigetaxi.fr";
 return (
 <Html lang="fr" dir="ltr">
 <Head />
 <Preview>Votre tarif personnalisé{p.prix? `: ${p.prix}`:""}</Preview>
 <Body style={main}>
 <Container style={container}>
 <Text style={brandBar}>Accès Prestige Taxi</Text>
 <Text style={brandTag}>Tarif personnalisé</Text>

 <Heading style={h1}>Bonjour {p.nom ||""}, voici votre tarif</Heading>

 <Text style={text}>
 Votre chauffeur a étudié votre demande et vous propose le tarif ci-dessous pour votre course en véhicule
 100 % électrique.
 </Text>

 <Section style={priceBox}>
 {p.ancien_prix && <Text style={oldPrice}>{p.ancien_prix}</Text>}
 <Text style={newPrice}>{p.prix ||"—"}</Text>
 </Section>

 <Section style={card}>
 {p.pickup_datetime && (
 <Text style={row}>
 <span style={rowLabel}>Date / heure: </span>
 {p.pickup_datetime}
 </Text>
 )}
 {p.depart && (
 <Text style={row}>
 <span style={rowLabel}>Départ: </span>
 {p.depart}
 </Text>
 )}
 {p.arrivee && (
 <Text style={row}>
 <span style={rowLabel}>Arrivée: </span>
 {p.arrivee}
 </Text>
 )}
 </Section>

 {p.message && <Text style={{...text, fontStyle:"italic"color: BRAND.textBody }}>« {p.message} »</Text>}

 <Section style={{ textAlign:"center"margin:"24px 0" }}>
 <Button href={url} style={button}>
 Voir ma course
 </Button>
 </Section>

 <Hr style={divider} />
 <Text style={footer}>Accès Prestige Taxi · votre mobilité, notre priorité</Text>
 </Container>
 </Body>
 </Html>
 );
};

const priceBox = { textAlign:"center" as const, margin:"8px 0 22px" };
const oldPrice = {
 fontSize:"16px"color:"#aaa"textDecoration:"line-through"margin:"0 0 4px"};
const newPrice = {
 fontSize:"34px"fontWeight: 800 as const,
 color: BRAND.primary,
 margin:"0"letterSpacing:"0.02em"};
const card = {
 background:"#fafafa"border:"1px solid #eee"borderRadius:"8px"padding:"14px 18px"margin:"0 0 20px"};
const row = { fontSize:"14px"color:"#222"margin:"5px 0"lineHeight:"1.6" };
const rowLabel = { color:"#666"fontWeight: 600 as const };

export const template = {
 component: Email,
 subject: (d: Record<string, any>) =>
 d?.prix? `Votre tarif personnalisé: ${d.prix} — Accès Prestige Taxi`:"Votre tarif personnalisé — Accès Prestige Taxi"displayName:"Tarif personnalisé"previewData: {
 nom:"Jean Dupont"depart:"Bordeaux Centre"arrivee:"Arcachon"pickup_datetime:"samedi 16 mai 2026 à 09:00"prix:"95,00 €"ancien_prix:"110,00 €"message:"Tarif forfaitaire négocié pour ce trajet longue distance."tracking_url:"https://accesprestigetaxi.fr/suivi/abcd-1234"},
} satisfies TemplateEntry;
