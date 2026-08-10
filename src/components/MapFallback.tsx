import { useEffect, useState } from "react";
import { AlertCircle, ExternalLink, MapPin } from "lucide-react";

/**
 * Repli affiché quand le SDK Google Maps ne peut pas se charger
 * (typiquement RefererNotAllowedMapError sur un domaine non autorisé) :
 * message clair pour l'utilisateur + aperçu statique de la zone servi par
 * /api/public/static-map, qui n'est pas soumis aux restrictions de référent.
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
    open: "Ouvrir dans Google Maps",
    details: "Détail technique",
    alt: "Aperçu statique de la zone desservie",
  },
  en: {
    title: "Interactive map temporarily unavailable",
    body: "The dynamic map is blocked on this domain. Here is a static preview of the area: booking and fare calculation work as usual.",
    open: "Open in Google Maps",
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
  const [imageFailed, setImageFailed] = useState(false);
  const src = `/api/public/static-map?lat=${lat}&lng=${lng}&zoom=${zoom}&w=640&h=360`;

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  return (
    <div className="absolute inset-0 overflow-auto bg-background/98" role="status">
      {!imageFailed && (
        <img
          src={src}
          alt={c.alt}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
      )}
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
            href={`https://www.google.com/maps/@${lat},${lng},${zoom}z`}
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
