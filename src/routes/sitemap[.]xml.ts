import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://www.accessprestigetaxi.fr";

import { GUIDE_ENTRIES } from "@/data/guide-charente";
import { DESTINATIONS } from "@/data/destinations";
import { VILLES } from "@/data/villes";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

/** Langues déclarées : le site sert la même URL en FR et EN (i18n côté client). */
const ALT_LANGS: Array<{ hreflang: string }> = [
  { hreflang: "fr" },
  { hreflang: "en" },
  { hreflang: "x-default" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/services", changefreq: "monthly", priority: "0.9" },
          { path: "/taxi-marennes", changefreq: "monthly", priority: "0.9" },
          { path: "/taxi-oleron", changefreq: "monthly", priority: "0.9" },
          { path: "/taxi-charente-maritime", changefreq: "monthly", priority: "0.9" },

          { path: "/faq", changefreq: "monthly", priority: "0.8" },
          { path: "/blog", changefreq: "weekly", priority: "0.9" },
          ...GUIDE_ENTRIES.map((e) => ({
            path: `/blog/${e.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          { path: "/reserver", changefreq: "monthly", priority: "0.9" },
          // Pages destinations SEO (Charente-Maritime)
          { path: "/destinations", changefreq: "monthly", priority: "0.9" },
          ...DESTINATIONS.map((d) => ({
            path: `/destinations/${d.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          // Pages locales par ville (Charente-Maritime)
          ...VILLES.map((v) => ({
            path: `/taxi/${v.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          { path: "/devis", changefreq: "monthly", priority: "0.8" },
          { path: "/securite", changefreq: "yearly", priority: "0.5" },
          { path: "/a-propos", changefreq: "monthly", priority: "0.7" },
          { path: "/contact", changefreq: "monthly", priority: "0.7" },
          { path: "/carte", changefreq: "monthly", priority: "0.5" },
          // NB : /driver et /driver-install.html sont en noindex (espace privé
          // des chauffeurs) — ils ne doivent donc PAS figurer dans le sitemap.
          { path: "/mentions-legales", changefreq: "yearly", priority: "0.3" },
          { path: "/confidentialite", changefreq: "yearly", priority: "0.3" },
        ];

        const urls = entries.map((e) => {
          const loc = `${BASE_URL}${e.path}`;
          return [
            `  <url>`,
            `    <loc>${loc}</loc>`,
            // La version anglaise est la même URL suffixée de ?lang=en :
            // déclarer la même href pour fr et en ferait ignorer l'alternance
            // par Google. On génère donc la bonne URL par langue.
            ...ALT_LANGS.map(
              (l) =>
                `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${
                  l.hreflang === "en" ? `${loc}?lang=en` : loc
                }" />`,
            ),
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n");
        });

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
