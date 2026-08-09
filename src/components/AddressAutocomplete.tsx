import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin } from "lucide-react";
import { placesAutocomplete, placeDetails, type PlaceSuggestion } from "@/lib/places";

export type GeocodeSuggestion = {
  label: string;
  lat: number;
  lng: number;
};

type Props = {
  value: string;
  onChange: (value: string, suggestion?: GeocodeSuggestion) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  lang?: string;
};

type Item = { label: string; placeId: string | null; lat: number | null; lng: number | null };

// Lieux emblématiques de Charente-Maritime proposés instantanément (sans appel
// réseau) ; le reste vient de Google Places via /api/public/places.
const CANONICAL: GeocodeSuggestion[] = [
  { label: "Aéroport La Rochelle-Île de Ré (LRH)", lat: 46.1792, lng: -1.1953 },
  { label: "Gare de La Rochelle", lat: 46.1531, lng: -1.1458 },
  { label: "Vieux-Port de La Rochelle", lat: 46.1558, lng: -1.1528 },
  { label: "Aquarium de La Rochelle", lat: 46.1539, lng: -1.1508 },
  { label: "Gare de Royan", lat: 45.6256, lng: -1.0275 },
  { label: "Port de Royan", lat: 45.6233, lng: -1.005 },
  { label: "Zoo de La Palmyre", lat: 45.6828, lng: -1.1675 },
  { label: "Fort Boyard", lat: 45.9992, lng: -1.2133 },
  { label: "Gare de Saintes", lat: 45.7486, lng: -0.6236 },
  { label: "Gare de Rochefort", lat: 45.9447, lng: -0.9636 },
  { label: "Châtelaillon-Plage", lat: 46.0731, lng: -1.0892 },
  { label: "Saint-Georges-de-Didonne", lat: 45.6286, lng: -0.9986 },
];

const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  disabled,
  autoFocus,
  onFocus,
  onBlur,
  className,
  lang = "fr",
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seqRef = useRef(0);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      if (!q || q.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      const seq = ++seqRef.current;
      setLoading(true);
      try {
        const normalized = fold(q);
        const canonicalHits: Item[] = CANONICAL.filter((c) => fold(c.label).includes(normalized)).map((c) => ({
          label: c.label,
          placeId: null,
          lat: c.lat,
          lng: c.lng,
        }));

        const remote: PlaceSuggestion[] = await placesAutocomplete(q, lang);
        if (seq !== seqRef.current) return;

        const merged: Item[] = [...canonicalHits];
        for (const r of remote) {
          if (merged.some((m) => fold(m.label) === fold(r.label))) continue;
          merged.push({ label: r.label, placeId: r.placeId, lat: r.lat, lng: r.lng });
        }
        setSuggestions(merged.slice(0, 6));
      } finally {
        if (seq === seqRef.current) setLoading(false);
      }
    },
    [lang],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, fetchSuggestions]);

  const pick = useCallback(
    async (item: Item) => {
      setOpen(false);
      inputRef.current?.blur();
      if (typeof item.lat === "number" && typeof item.lng === "number") {
        onChange(item.label, { label: item.label, lat: item.lat, lng: item.lng });
        return;
      }
      // Coordonnées résolues à la sélection (place_id → détails).
      onChange(item.label);
      if (!item.placeId) return;
      setLoading(true);
      try {
        const d = await placeDetails(item.placeId, lang);
        if (d) onChange(d.label || item.label, { label: d.label || item.label, lat: d.lat, lng: d.lng });
      } finally {
        setLoading(false);
      }
    },
    [onChange, lang],
  );


  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          onFocus?.();
          setOpen(true);
        }}
        onBlur={() => {
          onBlur?.();
          // delay to allow click on suggestion
          setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className="pr-10"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="cursor-pointer rounded-sm px-3 py-2 text-sm hover:bg-accent"
              onMouseDown={(e) => {
                e.preventDefault();
                void pick(s);
              }}

            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
