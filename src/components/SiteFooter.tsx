import { Link, useLocation } from "@tanstack/react-router";
import { useI18n, useT } from "@/i18n/I18nProvider";

const COPY = {
  fr: {
    tagline: "Votre taxi conventionné 100 % électrique en Charente-Maritime. —.",
    navTitle: "Navigation",
    nav: [
      { to: "/", label: "Accueil" },
      { to: "/services", label: "Services" },
      { to: "/blog", label: "Guide Charente-Maritime" },
      { to: "/reserver", label: "Réserver" },
      { to: "/a-propos", label: "À propos" },
      { to: "/devis", label: "Demander un devis" },
      { to: "/contact", label: "Contact" },
    ],
    ridesTitle: "Nos courses",
    rides: [
      "🏥 Transport conventionné CPAM",
      "🚉 Gares d'Angoulême & La Rochelle",
      "✈️ Aéroports La Rochelle & Bordeaux",
      "🍇 Cognac, Jarnac & vignobles",
      "🏖️ Royan, Île de Ré & Oléron",
    ],
    contactTitle: "Contact",
    zone: "📍 Charente-Maritime",
    rights: "Tous droits réservés.",
    security: "Sécurité & garanties",
    destinations: "Destinations",
    legal: "Mentions légales",
    privacy: "Confidentialité",
  },
  en: {
    tagline: "Excellence on every journey: a fully electric, medically-approved taxi service across Charente-Maritime.",
    navTitle: "Navigation",
    nav: [
      { to: "/", label: "Home" },
      { to: "/services", label: "Services" },
      { to: "/blog", label: "Charente Guide" },
      { to: "/reserver", label: "Book" },
      { to: "/a-propos", label: "About" },
      { to: "/devis", label: "Request a quote" },
      { to: "/contact", label: "Contact" },
    ],
    ridesTitle: "Our rides",
    rides: [
      "🏥 CPAM medical transport",
      "🚉 Angoulême & La Rochelle stations",
      "✈️ La Rochelle & Bordeaux airports",
      "🍇 Cognac, Jarnac & vineyards",
      "🏖️ Royan, Île de Ré & Oléron",
    ],
    contactTitle: "Contact",
    zone: "📍 Charente-Maritime",
    rights: "All rights reserved.",
    security: "Safety & guarantees",
    destinations: "Destinations",
    legal: "Legal notice",
    privacy: "Privacy policy",
  },
} as const;

export function SiteFooter() {
  const { pathname } = useLocation();
  const { lang } = useI18n();
  const t = useT();
  const c = COPY[lang === "en" ? "en" : "fr"];

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/tracking") ||
    pathname.startsWith("/chauffeur") ||
    pathname.startsWith("/lovable") ||
    pathname.startsWith("/email")
  ) {
    return null;
  }

  const year = new Date().getFullYear();

  return (
    <footer aria-label={t("aria.footer")}
      style={{
        background: "#EDE6D4",
        color: "#4a4538",
        /* Reduced top padding on mobile */
        padding: "40px 16px 24px",
        fontFamily: "'DM Sans',sans-serif",
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');

        /* Footer responsive grid */
        .footer-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 640px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 36px;
          }
        }
        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 40px;
          }
        }

        /* Footer brand col spans full width on small, half on sm */
        .footer-brand {
          grid-column: 1 / -1;
        }
        @media (min-width: 1024px) {
          .footer-brand {
            grid-column: 1 / 2;
          }
        }

        /* Bottom bar */
        .footer-bottom {
          max-width: 1200px;
          margin: 32px auto 0;
          padding-top: 20px;
          border-top: 1px solid rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #6b6555;
          text-align: center;
        }
        @media (min-width: 640px) {
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
          }
        }

        /* Social buttons: bigger tap target on mobile */
        .footer-social-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 18px;
          transition: background 0.2s;
        }
        .footer-social-btn:active {
          background: rgba(0,0,0,0.12);
        }

        /* Footer links: bigger tap area */
        .footer-link {
          color: #4a4538;
          text-decoration: none;
          font-size: 15px;
          padding: 3px 0;
          display: inline-block;
        }
        @media (min-width: 1024px) {
          .footer-link { font-size: 14px; }
        }
        .footer-link-sm {
          color: #4a4538;
          text-decoration: none;
          font-size: 12px;
        }

        .footer-li-text {
          font-size: 15px;
          color: #6b6555;
          padding: 3px 0;
        }
        @media (min-width: 1024px) {
          .footer-li-text { font-size: 14px; }
        }

        .footer-col-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          color: #2c2718;
          margin: 0 0 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>

      <div className="footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 900,
              fontSize: 20,
              color: "#2c2718",
              marginBottom: 10,
            }}
          >
            🚕 Access Prestige Taxi
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#94a3b8", margin: 0, maxWidth: 280 }}>
            {c.tagline}
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <a
              href="mailto:accessprestigetaxi@gmail.com"
              aria-label="Email"
              className="footer-social-btn"
              style={{ border: "1px solid rgba(0,0,0,0.08)" }}
            >
              ✉️
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="footer-col-title">{c.navTitle}</h3>
          <ul className="footer-ul">
            {c.nav.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="footer-link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="footer-col-title">{c.ridesTitle}</h3>
          <ul className="footer-ul">
            {c.rides.map((r) => (
              <li key={r} className="footer-li-text">{r}</li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="footer-col-title">{c.contactTitle}</h3>
          <ul className="footer-ul">
            <li>
              <a href="tel:0650260015" className="footer-link">
                📞 Patricia · 06 50 26 00 15
              </a>
            </li>
            <li>
              <a href="tel:0603444863" className="footer-link">
                📞 Alain · 06 03 44 48 63
              </a>
            </li>
            <li>
              <a href="mailto:accessprestigetaxi@gmail.com" className="footer-link" style={{ wordBreak: "break-all" }}>
                ✉️ accessprestigetaxi@gmail.com
              </a>
            </li>
            <li className="footer-li-text">{c.zone}</li>
          </ul>

        </div>
      </div>


      {/* SEO internal links — accessible from mobile, tablet & desktop menu */}
      <div className="mx-auto mt-6 max-w-3xl px-4 text-center text-xs leading-relaxed text-[#6b6555]">
        {lang === "en" ? (
          <>
            Access Prestige Taxi is available on{" "}
            <Link to="/" className="underline underline-offset-2 hover:text-[#2c2718]">mobile</Link>,{" "}
            <Link to="/" className="underline underline-offset-2 hover:text-[#2c2718]">tablet</Link>{" "}
            and{" "}
            <Link to="/" className="underline underline-offset-2 hover:text-[#2c2718]">desktop</Link>.{" "}
            Explore our{" "}
            <Link to="/services" className="underline underline-offset-2 hover:text-[#2c2718]">taxi services</Link>,{" "}
            <Link to="/reserver" className="underline underline-offset-2 hover:text-[#2c2718]">book a ride</Link>,{" "}
            <Link to="/devis" className="underline underline-offset-2 hover:text-[#2c2718]">request a quote</Link>,{" "}
            read our{" "}
            <Link to="/blog" className="underline underline-offset-2 hover:text-[#2c2718]">Charente-Maritime guide</Link>,{" "}
            check our{" "}
            <Link to="/destinations" className="underline underline-offset-2 hover:text-[#2c2718]">destinations</Link>{" "}
            or{" "}
            <Link to="/contact" className="underline underline-offset-2 hover:text-[#2c2718]">contact us</Link>.
          </>
        ) : (
          <>
            Access Prestige Taxi est accessible depuis votre{" "}
            <Link to="/" className="underline underline-offset-2 hover:text-[#2c2718]">mobile</Link>, votre{" "}
            <Link to="/" className="underline underline-offset-2 hover:text-[#2c2718]">tablette</Link>{" "}
            ou votre{" "}
            <Link to="/" className="underline underline-offset-2 hover:text-[#2c2718]">ordinateur</Link>.{" "}
            Découvrez nos{" "}
            <Link to="/services" className="underline underline-offset-2 hover:text-[#2c2718]">services de taxi</Link>,{" "}
            <Link to="/reserver" className="underline underline-offset-2 hover:text-[#2c2718]">réservez votre course</Link>,{" "}
            <Link to="/devis" className="underline underline-offset-2 hover:text-[#2c2718]">demandez un devis</Link>,{" "}
            consultez notre{" "}
            <Link to="/blog" className="underline underline-offset-2 hover:text-[#2c2718]">guide Charente-Maritime</Link>,{" "}
            nos{" "}
            <Link to="/destinations" className="underline underline-offset-2 hover:text-[#2c2718]">destinations</Link>{" "}
            ou notre page{" "}
            <Link to="/contact" className="underline underline-offset-2 hover:text-[#2c2718]">contact</Link>.
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div>© {year} Access Prestige Taxi. {c.rights}</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Link to="/securite" className="footer-link-sm">
            {c.security}
          </Link>
          <Link to="/destinations" className="footer-link-sm">
            {c.destinations}
          </Link>
          <Link to="/notifications" className="footer-link-sm">
            Notifications
          </Link>

          <Link to="/mentions-legales" className="footer-link-sm">
            {c.legal}
          </Link>
          <Link to="/confidentialite" className="footer-link-sm">
            {c.privacy}
          </Link>
        </div>
      </div>

    </footer>
  );
}

export default SiteFooter;
