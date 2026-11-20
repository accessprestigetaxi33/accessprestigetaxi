import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { REMOVED_URLS } from "@/data/removed-urls";

const BASE_URL = "https://www.accessprestigetaxi.fr";
// Date du retrait : Google repasse en priorité les URL dont la date a changé.
const LASTMOD = "2026-11-20";

export const Route = createFileRoute("/sitemap-removed.xml")({
  server: {
    handlers: {
      GET: async () => {
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...REMOVED_URLS.map((p) => `  <url>\n    <loc>${BASE_URL}${p}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n  </url>`),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
