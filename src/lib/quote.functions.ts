import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { detaillerPrix } from "@/lib/tarif";

const QuoteInput = z.object({
  depart: z.string().min(3).max(200),
  arrivee: z.string().min(3).max(200),
  /** ISO local datetime "YYYY-MM-DDTHH:mm" */
  when: z.string().max(40).optional(),
});

export type QuoteResult =
  | {
      ok: true;
      distance_km: number;
      duree_s: number;
      /** Tracé de l'itinéraire retenu, [lat, lng][] — pour l'aperçu carte. */
      coords: [number, number][];
      prix: number;
      nuit: boolean;
      /** "jour" | "nuit" | "mixte" */
      regime: "jour" | "nuit" | "mixte";
      detail: {
        priseEnCharge: number;
        prixKm: number;
        tarifKm: number;
        tarifKmJour: number;
        tarifKmNuit: number;
        kmJour: number;
        kmNuit: number;
        prixJour: number;
        prixNuit: number;
        pctJour: number;
        pctNuit: number;
      };
    }
  | { ok: false; error: string };

const MINIMUM = 12;

const UA = "nova-taxi-bordeaux/1.0 (https://novataxi.fr)";

/** Géocodage OSM : Photon (précis sur les POI) avec repli Nominatim. */
async function geocode(q: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1&lang=fr&lat=44.8378&lon=-0.5792`,
      { headers: { "User-Agent": UA } },
    );
    const json: any = await res.json();
    const c = json?.features?.[0]?.geometry?.coordinates;
    if (Array.isArray(c)) return [Number(c[0]), Number(c[1])];
  } catch {
    /* repli ci-dessous */
  }
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "fr,es,pt,it,be,de,ch,lu,nl,gb");
    url.searchParams.set("q", q);
    const res = await fetch(url.toString(), { headers: { "User-Agent": UA } });
    const json: any = await res.json();
    const first = Array.isArray(json) ? json[0] : null;
    if (!first) return null;
    return [Number(first.lon), Number(first.lat)];
  } catch {
    return null;
  }
}

/** Polyline OSRM (précision 6) → [lat, lng][]. */
function decodePolyline6(encoded: string): [number, number][] {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const out: [number, number][] = [];
  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    out.push([lat / 1e6, lng / 1e6]);
  }
  return out;
}

/** OSRM ignore le trafic : on applique un facteur horaire réaliste (Paris). */
function trafficFactor(iso: string): number {
  const paris = new Date(new Date(iso).toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  const day = paris.getDay();
  const h = paris.getHours();
  const weekday = day >= 1 && day <= 5;
  if (weekday && ((h >= 7 && h < 10) || (h >= 16 && h < 19))) return 1.25;
  if (h >= 22 || h < 6) return 1.0;
  return 1.08;
}

export const quoteRide = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => QuoteInput.parse(data))
  .handler(async ({ data }): Promise<QuoteResult> => {
    let distance_km: number;
    let duree_s: number;
    let coords: [number, number][] = [];
    const whenIso = data.when || new Date().toISOString();
    try {
      const [a, b] = await Promise.all([geocode(data.depart), geocode(data.arrivee)]);
      if (!a || !b) return { ok: false, error: "not-found" };
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${a[0]},${a[1]};${b[0]},${b[1]}` +
          `?overview=full&geometries=polyline6&alternatives=3&steps=false`,
        { headers: { "User-Agent": UA } },
      );
      const json: any = await res.json();
      const routes: any[] = json?.routes ?? [];
      if (routes.length === 0) return { ok: false, error: "not-found" };
      // Itinéraire le plus rapide : celui qu'un GPS grand public proposerait.
      const route = routes.reduce((x, y) => (y.duration < x.duration ? y : x));
      distance_km = Math.round((route.distance / 1000) * 10) / 10;
      duree_s = Math.round(route.duration * trafficFactor(whenIso));
      coords = route.geometry ? decodePolyline6(route.geometry) : [];
    } catch {
      return { ok: false, error: "network" };
    }


    // Tarification mixte jour/nuit au prorata du trajet (heure de Paris).
    const iso = whenIso;
    const d = detaillerPrix(distance_km, iso, Math.max(Math.round(duree_s / 60), 1));
    const prix = Math.max(MINIMUM, d.total);
    const prixKm = Math.round((d.prixJour + d.prixNuit) * 100) / 100;

    return {
      ok: true,
      distance_km,
      duree_s,
      coords,
      prix,
      nuit: !d.departJour,
      regime: d.regime,
      detail: {
        priseEnCharge: d.priseEnCharge,
        prixKm,
        tarifKm: d.departJour ? d.tarifKmJour : d.tarifKmNuit,
        tarifKmJour: d.tarifKmJour,
        tarifKmNuit: d.tarifKmNuit,
        kmJour: d.kmJour,
        kmNuit: d.kmNuit,
        prixJour: d.prixJour,
        prixNuit: d.prixNuit,
        pctJour: d.pctJour,
        pctNuit: d.pctNuit,
      },
    };
  });
