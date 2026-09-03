// Facture PDF d'une course (page /suivi/:id) — générée côté navigateur.
// jsPDF (~400 Ko) est chargé à la demande, au clic sur « Télécharger la facture ».
// Bilingue FR / EN, montant = prix final (compteur) si disponible, sinon estimé.

async function loadJsPDF() {
  return (await import("jspdf")).default;
}

const GOLD = "#C9A84C";
const DARK = "#0A0A0A";
const VAT_RATE = 0.1; // TVA 10 % transport de personnes

type RideLike = {
  id: string;
  suivi_id?: string | null;
  tracking_id?: string | null;
  depart?: string | null;
  destination?: string | null;
  arrivee?: string | null;
  pickup_datetime?: string | null;
  nb_passagers?: number | null;
  bagages?: number | null;
  distance_km?: number | null;
  mode_paiement?: string | null;
  paiement?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  email?: string | null;
  final_price?: number | null;
  prix_estime?: number | null;
  status?: string | null;
};

const L = {
  fr: {
    sub: "Facture de course — Charente-Maritime",
    title: "Facture de course",
    ref: "Référence",
    issued: "Émise le",
    client: "Client",
    details: "Détails de la course",
    date: "Date / heure",
    from: "Départ",
    to: "Arrivée",
    pax: "Passagers",
    bags: "Bagages",
    dist: "Distance",
    pay: "Paiement",
    ht: "Total HT",
    vat: "TVA 10 %",
    ttc: "Total TTC",
    final: "Prix final au compteur",
    est: "Prix estimé",
    footer:
      "Access Prestige Taxi — accessprestigetaxi@gmail.com — 06 50 26 00 15 — Charente-Maritime",
    file: "facture-course",
  },
  en: {
    sub: "Ride invoice — Charente-Maritime",
    title: "Ride invoice",
    ref: "Reference",
    issued: "Issued on",
    client: "Customer",
    details: "Ride details",
    date: "Date / time",
    from: "Pickup",
    to: "Drop-off",
    pax: "Passengers",
    bags: "Luggage",
    dist: "Distance",
    pay: "Payment",
    ht: "Subtotal excl. VAT",
    vat: "VAT 10%",
    ttc: "Total incl. VAT",
    final: "Final metered fare",
    est: "Estimated fare",
    footer:
      "Access Prestige Taxi — accessprestigetaxi@gmail.com — +33 6 50 26 00 15 — Charente-Maritime",
    file: "ride-invoice",
  },
} as const;

export async function downloadRideInvoicePDF(r: RideLike, lang: string = "fr") {
  const isEn = lang.startsWith("en");
  const l = isEn ? L.en : L.fr;
  const intl = isEn ? "en-GB" : "fr-FR";
  const money = (n: number) =>
    new Intl.NumberFormat(intl, { style: "currency", currency: "EUR" }).format(n);
  const fmtDate = (iso?: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(intl, {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Europe/Paris",
      });
    } catch {
      return iso;
    }
  };

  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  // Bandeau
  doc.setFillColor(DARK);
  doc.rect(0, 0, W, 90, "F");
  doc.setTextColor(GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("ACCESS PRESTIGE TAXI", 40, 45);
  doc.setFontSize(10);
  doc.setTextColor("#E8C96D");
  doc.text(l.sub, 40, 65);

  const ref = String(r.suivi_id || r.tracking_id || r.id).slice(-8).toUpperCase();
  doc.setTextColor(DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(l.title, 40, 130);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#555");
  doc.text(`${l.ref} : ${ref}`, 40, 150);
  doc.text(`${l.issued} : ${new Date().toLocaleString(intl)}`, 40, 165);

  doc.setDrawColor(GOLD);
  doc.setLineWidth(1.2);
  doc.line(40, 180, W - 40, 180);

  let y = 210;
  const label = (txt: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(DARK);
    doc.text(txt, 40, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#333");
    y += 18;
  };
  const line = (txt: string) => {
    doc.text(txt, 40, y);
    y += 14;
  };

  if (r.client_name || r.client_email || r.client_phone || r.email) {
    label(l.client);
    if (r.client_name) line(r.client_name);
    if (r.client_email || r.email) line(String(r.client_email || r.email));
    if (r.client_phone) line(r.client_phone);
    y += 16;
  }

  label(l.details);
  line(`${l.date} : ${fmtDate(r.pickup_datetime)}`);
  line(`${l.from} : ${r.depart || "—"}`);
  line(`${l.to} : ${r.destination || r.arrivee || "—"}`);
  if (r.nb_passagers != null) line(`${l.pax} : ${r.nb_passagers}`);
  if (r.bagages != null) line(`${l.bags} : ${r.bagages}`);
  if (r.distance_km != null) line(`${l.dist} : ${Number(r.distance_km).toFixed(1)} km`);
  if (r.mode_paiement || r.paiement) line(`${l.pay} : ${r.mode_paiement || r.paiement}`);

  const isFinal = r.final_price != null;
  const total = Number(isFinal ? r.final_price : (r.prix_estime ?? 0)) || 0;
  const ht = total / (1 + VAT_RATE);
  const tva = total - ht;

  y += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#333");
  doc.text(`${l.ht}`, 40, y);
  doc.text(money(ht), W - 60, y, { align: "right" });
  y += 16;
  doc.text(`${l.vat}`, 40, y);
  doc.text(money(tva), W - 60, y, { align: "right" });

  y += 18;
  doc.setFillColor("#FAF6E8");
  doc.rect(40, y, W - 80, 62, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(DARK);
  doc.text(isFinal ? l.final : l.est, 60, y + 26);
  doc.setFontSize(20);
  doc.setTextColor(GOLD);
  doc.text(money(total), W - 60, y + 38, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor("#666");
  doc.text(l.ttc, 60, y + 46);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor("#888");
  doc.text(l.footer, W / 2, 800, { align: "center" });

  doc.save(`${l.file}-${ref}.pdf`);
}
