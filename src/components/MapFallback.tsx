import { useMemo } from "react";
import { AlertCircle, ExternalLink, MapPin } from "lucide-react";

/**
 * Repli affiché quand le SDK Google Maps ne peut pas se charger
 * (typiquement RefererNotAllowedMapError sur un domaine non autorisé) :
 * message clair pour l'utilisateur + aperçu de la zone composé de tuiles
 * OpenStreetMap (aucune clé, aucune restriction de domaine).
 */
export type MapFallbackProps = {
  lang?: "fr" | "en";
  lat?: number;
  lng?: number;
  zoom?: number;
  label?: string;
  /** Message technique (affiché repliable, utile au support). */
  detail?: string | null;
};

const COPY = {
  fr: {
    title: "Carte interactive momentanément indisponible",
    body: "L'affichage dynamique est bloqué sur ce domaine. Voici un aperçu de la zone : la réservation et le calcul du tarif fonctionnent normalement.",
    open: "Ouvrir la carte OpenStreetMap",
    details: "Détail technique",
    alt: "Aperçu statique de la zone desservie",
  },
  en: {
    title: "Interactive map temporarily unavailable",
    body: "The dynamic map is blocked on this domain. Here is a static preview of the area: booking and fare calculation work as usual.",
    open: "Open the OpenStreetMap map",
    details: "Technical details",
    alt: "Static preview of the service area",
  },
} as const;

export function MapFallback({
  lang = "fr",
  lat = 46.1591,
  lng = -1.152,
  zoom = 11,
  label,
  detail,
}: MapFallbackProps) {
  const c = COPY[lang === "en" ? "en" : "fr"];

  // Aperçu OpenStreetMap : mosaïque 3×2 de tuiles centrée sur le point.
  const tiles = useMemo(() => {
    const z = Math.min(Math.max(Math.round(zoom), 1), 18);
    const n = 2 ** z;
    const xc = Math.floor(((lng + 180) / 360) * n);
    const latRad = (lat * Math.PI) / 180;
    const yc = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
    const out: string[] = [];
    for (let dy = -1; dy <= 0; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = ((xc + dx) % n + n) % n;
        const y = Math.min(Math.max(yc + dy, 0), n - 1);
        out.push(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`);
      }
    }
    return out;
  }, [lat, lng, zoom]);

  return (
    <div className="absolute inset-0 overflow-auto bg-background/98" role="status">
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 opacity-60" aria-hidden="true">
        {tiles.map((src) => (
          <img key={src} src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
        ))}
      </div>
      <span className="sr-only">{c.alt}</span>
      <div className="relative flex h-full items-center justify-center p-4">
        <div className="max-w-md rounded-xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
            {c.title}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.body}</p>
          {label && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {label}
            </p>
          )}
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${Math.round(zoom)}/${lat}/${lng}`}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            {c.open}
          </a>
          {detail && (
            <details className="mt-3">
              <summary className="cursor-pointer text-[11px] text-muted-foreground">{c.details}</summary>
              <pre className="mt-1 whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">{detail}</pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
