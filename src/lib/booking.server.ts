// Cœur déterministe du nouveau système de réservation (sans IA).
// Géocodage + itinéraire + tarification officielle, côté serveur uniquement.
import { geocodeGoogle, routeGoogle } from "@/lib/google.server";
import { detaillerPrix, type DetailPrix } from "@/lib/tarif";

export type ResolvedPlace = { label: string; lat: number; lng: number };

export type RideQuote = {
  depart: ResolvedPlace;
  arrivee: ResolvedPlace;
  distanceKm: number;
  dureeS: number;
  pickupIso: string;
  prix: DetailPrix;
  vehicule: "berline" | "van";
};

export async function resolvePlace(
  input: string,
  coords?: { lat: number; lng: number } | null,
): Promise<ResolvedPlace | null> {
  const label = (input ?? "").trim();
  if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
    return { label: label || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`, lat: coords.lat, lng: coords.lng };
  }
  if (label.length < 3) return null;
  const g = await geocodeGoogle(label);
  if (!g) return null;
  return { label: g.label, lat: g.lat, lng: g.lng };
}

export function pickVehicle(passagers: number, bagages: number): "berline" | "van" {
  return passagers > 4 || bagages > 4 ? "van" : "berline";
}

export async function computeQuote(args: {
  depart: string;
  departCoord?: { lat: number; lng: number } | null;
  arrivee: string;
  arriveeCoord?: { lat: number; lng: number } | null;
  pickupIso: string;
  passagers: number;
  bagages: number;
}): Promise<RideQuote> {
  const [from, to] = await Promise.all([
    resolvePlace(args.depart, args.departCoord),
    resolvePlace(args.arrivee, args.arriveeCoord),
  ]);
  if (!from) throw new Error("DEPART_UNRESOLVED");
  if (!to) throw new Error("ARRIVEE_UNRESOLVED");

  const route = await routeGoogle(
    { lat: from.lat, lng: from.lng },
    { lat: to.lat, lng: to.lng },
    args.pickupIso,
  );
  if (!route || !(route.distanceKm > 0)) throw new Error("ROUTE_FAILED");

  const dureeMin = Math.max(Math.round(route.dureeS / 60), 1);
  const prix = detaillerPrix(route.distanceKm, args.pickupIso, dureeMin);

  return {
    depart: from,
    arrivee: to,
    distanceKm: Number(route.distanceKm.toFixed(1)),
    dureeS: route.dureeS,
    pickupIso: args.pickupIso,
    prix,
    vehicule: pickVehicle(args.passagers, args.bagages),
  };
}
