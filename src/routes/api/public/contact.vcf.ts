import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";

const VCARD = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "FN:Patricia — Access Prestige Taxi",
  "N:Patricia;Access Prestige Taxi;;;",
  "ORG:Access Prestige Taxi",
  "TEL;TYPE=CELL,VOICE,PREF:+33650260015",
  "EMAIL;TYPE=INTERNET,PREF:accessprestigetaxi@gmail.com",
  "URL:https://accessprestigetaxi.lovable.app",
  "END:VCARD",
  "",
].join("\r\n");

const VCARD_ETAG = `"${createHash("sha256").update(VCARD).digest("hex").slice(0, 16)}"`;
const VCARD_LAST_MODIFIED = "Wed, 01 Jan 2025 00:00:00 GMT";

export const Route = createFileRoute("/api/public/contact/vcf")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const ifNoneMatch = request.headers.get("If-None-Match");
        if (ifNoneMatch === VCARD_ETAG) {
          return new Response(null, {
            status: 304,
            headers: {
              "Cache-Control": "public, no-cache, must-revalidate, max-age=0",
              ETag: VCARD_ETAG,
              "Last-Modified": VCARD_LAST_MODIFIED,
            },
          });
        }

        return new Response(VCARD, {
          status: 200,
          headers: {
            "Content-Type": "text/vcard; charset=utf-8",
            "Content-Disposition": 'inline; filename="taxi-city-bordeaux.vcf"',
            "Cache-Control": "public, no-cache, must-revalidate, max-age=0",
            ETag: VCARD_ETAG,
            "Last-Modified": VCARD_LAST_MODIFIED,
            Vary: "Accept-Encoding",
          },
        });
      },
    },
  },
});
