-- ── tracking_events : ouvertures du lien de suivi ────────────────────────────
CREATE TABLE public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE CASCADE,
  event_type text NOT NULL DEFAULT 'tracking_opened',
  source text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracking_events_created_at ON public.tracking_events (created_at DESC);
CREATE INDEX idx_tracking_events_reservation ON public.tracking_events (reservation_id);

GRANT INSERT ON public.tracking_events TO anon, authenticated;
GRANT ALL ON public.tracking_events TO service_role;

ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracking_events_insert_public"
  ON public.tracking_events FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(COALESCE(event_type, '')) BETWEEN 1 AND 60
    AND char_length(COALESCE(source, '')) <= 60
    AND char_length(COALESCE(user_agent, '')) <= 300
  );

-- ── recurring_rides : demandes de course récurrente ─────────────────────────
CREATE TABLE public.recurring_rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  depart text NOT NULL,
  destination text NOT NULL,
  nb_passagers smallint NOT NULL DEFAULT 1,
  nb_bagages smallint NOT NULL DEFAULT 0,
  mode_paiement text NOT NULL DEFAULT 'cb',
  client_name text,
  frequency text NOT NULL DEFAULT 'weekly',
  day_of_week smallint,
  time_hhmm text NOT NULL DEFAULT '08:00',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_recurring_rides_created_at ON public.recurring_rides (created_at DESC);

CREATE TRIGGER trg_recurring_rides_updated
  BEFORE UPDATE ON public.recurring_rides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT INSERT ON public.recurring_rides TO anon, authenticated;
GRANT ALL ON public.recurring_rides TO service_role;

ALTER TABLE public.recurring_rides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recurring_rides_insert_public"
  ON public.recurring_rides FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(depart) BETWEEN 1 AND 300
    AND char_length(destination) BETWEEN 1 AND 300
    AND nb_passagers BETWEEN 1 AND 8
    AND nb_bagages BETWEEN 0 AND 12
    AND char_length(mode_paiement) <= 30
    AND char_length(COALESCE(client_name, '')) <= 120
    AND frequency IN ('weekly', 'biweekly', 'monthly', 'daily')
    AND (day_of_week IS NULL OR day_of_week BETWEEN 0 AND 6)
    AND time_hhmm ~ '^[0-2][0-9]:[0-5][0-9]$'
  );