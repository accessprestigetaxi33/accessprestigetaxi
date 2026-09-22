CREATE TABLE IF NOT EXISTS public.geo_cache (
  cache_key text PRIMARY KEY,
  payload jsonb NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.geo_cache TO service_role;

ALTER TABLE public.geo_cache ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS geo_cache_expires_idx ON public.geo_cache (expires_at);

COMMENT ON TABLE public.geo_cache IS 'Cache serveur des adresses (Photon/Nominatim) et itineraires (OSRM). Service role uniquement.';