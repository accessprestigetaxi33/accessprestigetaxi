import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { loadGoogleMaps } from "@/lib/googleMaps";
import {
  locateUser,
  describePosition,
  positionMessage,
  failureMessage,
  accuracyLabel,
  sourceLabel,
  type GeoFix,
} from "@/lib/geolocation";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Mode de prévisualisation technique : vérifier la carte Google et la
 * géolocalisation sur le domaine réellement servi (preview ou
 * accessprestigetaxi.fr) avant une publication définitive.
 * Page volontairement non indexée.
 */
export const Route = createFileRoute("/diagnostic")({
  head: () => ({
    meta: [
      { title: "Diagnostic carte & géolocalisation — Access Prestige Taxi" },
      {
        name: "description",
        content:
          "Page technique de vérification : clé Google Maps servie au domaine courant, chargement de la carte et cascade de géolocalisation.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Diagnostic carte & géolocalisation" },
      { property: "og:description", content: "Vérification technique carte et géolocalisation avant publication." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DiagnosticPage,
});

type Status = "idle" | "running" | "ok" | "warn" | "fail";

function Badge({ status }: { status: Status }) {
  const map: Record<Status, [string, string]> = {
    idle: ["—", "bg-muted text-muted-foreground"],
    running: ["…", "bg-muted text-muted-foreground"],
    ok: ["OK", "bg-primary/15 text-primary"],
    warn: ["⚠", "bg-amber-500/15 text-amber-600"],
    fail: ["✕", "bg-destructive/15 text-destructive"],
  };
  const [label, cls] = map[status];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

function DiagnosticPage() {
  const { lang } = useI18n();
  const L = lang === "en" ? "en" : "fr";

  const [host, setHost] = useState("");
  const [cfgStatus, setCfgStatus] = useState<Status>("idle");
  const [cfgDetail, setCfgDetail] = useState("");
  const [mapStatus, setMapStatus] = useState<Status>("idle");
  const [mapDetail, setMapDetail] = useState("");
  const [geoStatus, setGeoStatus] = useState<Status>("idle");
  const [geoDetail, setGeoDetail] = useState("");
  const [fix, setFix] = useState<GeoFix | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  const runMaps = useCallback(async () => {
    setCfgStatus("running");
    setMapStatus("running");
    setCfgDetail("");
    setMapDetail("");
    try {
      const res = await fetch("/api/public/maps-config", { cache: "no-store" });
      const cfg: any = await res.json().catch(() => null);
      const key: string = cfg?.apiKey || cfg?.key || (Array.isArray(cfg?.keys) ? cfg.keys[0] : "") || "";
      if (!key) {
        setCfgStatus("fail");
        setCfgDetail(
          L === "en"
            ? "No browser Maps key served for this domain."
            : "Aucune clé navigateur Maps servie pour ce domaine.",
        );
        setMapStatus("fail");
        return;
      }
      setCfgStatus("ok");
      setCfgDetail(
        `${L === "en" ? "Key served" : "Clé servie"} : ${key.slice(0, 8)}…${key.slice(-4)}${
          cfg?.source ? ` (${cfg.source})` : ""
        }`,
      );

      await loadGoogleMaps();
      const g = (window as any).google;
      if (!g?.maps || !mapRef.current) throw new Error("maps unavailable");
      const map = new g.maps.Map(mapRef.current, {
        center: { lat: 45.746, lng: -0.6337 },
        zoom: 11,
        disableDefaultUI: true,
      });
      const timeout = setTimeout(() => {
        setMapStatus((s) => (s === "running" ? "warn" : s));
        setMapDetail(
          L === "en"
            ? "Tiles did not load within 8s — check referrer restrictions for this domain."
            : "Les tuiles n'ont pas chargé en 8 s — vérifiez les référents autorisés pour ce domaine.",
        );
      }, 8000);
      g.maps.event.addListenerOnce(map, "tilesloaded", () => {
        clearTimeout(timeout);
        setMapStatus("ok");
        setMapDetail(
          L === "en" ? "Interactive map rendered correctly." : "Carte interactive affichée correctement.",
        );
      });
    } catch (err) {
      setMapStatus("fail");
      setMapDetail((err as Error).message);
    }
  }, [L]);

  const runGeo = useCallback(async () => {
    setGeoStatus("running");
    setGeoDetail("");
    setFix(null);
    const outcome = await locateUser();
    if (!outcome.ok) {
      setGeoStatus("fail");
      setGeoDetail(failureMessage(outcome.reason, L));
      return;
    }
    const { city } = await describePosition(outcome.fix.lat, outcome.fix.lng, L);
    setFix(outcome.fix);
    setGeoStatus(outcome.fix.approximate ? "warn" : "ok");
    setGeoDetail(positionMessage(outcome.fix, city, L));
  }, [L]);

  useEffect(() => {
    setHost(window.location.host);
    void runMaps();
    void runGeo();
  }, [runMaps, runGeo]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">
        {L === "en" ? "Map & location preview check" : "Vérification carte & géolocalisation"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {L === "en"
          ? "Run this page on the exact domain you want to validate (preview or accessprestigetaxi.fr) before publishing."
          : "Ouvrez cette page sur le domaine exact à valider (preview ou accessprestigetaxi.fr) avant publication."}{" "}
        <strong>{host}</strong>
      </p>

      <section className="mt-6 space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">{L === "en" ? "Maps key for this domain" : "Clé Maps de ce domaine"}</h2>
            <Badge status={cfgStatus} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{cfgDetail || "…"}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">{L === "en" ? "Interactive map" : "Carte interactive"}</h2>
            <Badge status={mapStatus} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{mapDetail || "…"}</p>
          <div ref={mapRef} className="mt-3 h-56 w-full overflow-hidden rounded-lg bg-muted" />
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">{L === "en" ? "Geolocation cascade" : "Cascade de géolocalisation"}</h2>
            <Badge status={geoStatus} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{geoDetail || "…"}</p>
          {fix && (
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                {L === "en" ? "Source" : "Source"} : {sourceLabel(fix.source, L)}
              </li>
              <li>
                {L === "en" ? "Accuracy" : "Précision"} : {accuracyLabel(fix.accuracy, L)}
              </li>
              <li>
                {L === "en" ? "Coordinates" : "Coordonnées"} : {fix.lat.toFixed(5)}, {fix.lng.toFixed(5)}
              </li>
            </ul>
          )}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void runMaps()}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          {L === "en" ? "Re-test map" : "Retester la carte"}
        </button>
        <button
          type="button"
          onClick={() => void runGeo()}
          className="rounded-full border border-border px-5 py-2 text-sm font-semibold"
        >
          {L === "en" ? "Re-test location" : "Retester la position"}
        </button>
        <Link to="/" className="rounded-full border border-border px-5 py-2 text-sm font-semibold">
          {L === "en" ? "Back to site" : "Retour au site"}
        </Link>
      </div>
    </main>
  );
}
