-- 1. tracking_events: no direct public insert, require suivi key possession
DROP POLICY IF EXISTS tracking_events_insert_public ON public.tracking_events;
REVOKE INSERT ON public.tracking_events FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.log_tracking_event(
  p_key text,
  p_event_type text,
  p_source text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_id uuid;
BEGIN
  IF p_key IS NULL OR char_length(p_key) < 4 OR char_length(p_key) > 100 THEN RETURN false; END IF;
  IF p_event_type IS NULL OR char_length(p_event_type) < 1 OR char_length(p_event_type) > 60 THEN RETURN false; END IF;

  SELECT r.id INTO v_id FROM public.reservations r
   WHERE r.suivi_id = p_key
      OR r.tracking_id = p_key
      OR (p_key ~ '^[0-9a-fA-F-]{36}$' AND r.id::text = lower(p_key))
   LIMIT 1;

  IF v_id IS NULL THEN RETURN false; END IF;

  INSERT INTO public.tracking_events (reservation_id, event_type, source, user_agent)
  VALUES (v_id, p_event_type, left(COALESCE(p_source, ''), 60), left(COALESCE(p_user_agent, ''), 300));
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.log_tracking_event(text, text, text, text) TO anon, authenticated;

-- 2. recurring_rides: no direct public insert, derive from reservation via suivi key
DROP POLICY IF EXISTS recurring_rides_insert_public ON public.recurring_rides;
REVOKE INSERT ON public.recurring_rides FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.request_recurring_ride(
  p_key text,
  p_frequency text,
  p_day_of_week smallint,
  p_time_hhmm text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE r public.reservations%ROWTYPE;
BEGIN
  IF p_key IS NULL OR char_length(p_key) < 4 OR char_length(p_key) > 100 THEN RETURN false; END IF;
  IF p_frequency IS NULL OR p_frequency NOT IN ('weekly','biweekly','monthly','daily') THEN RETURN false; END IF;
  IF p_time_hhmm IS NULL OR p_time_hhmm !~ '^[0-2][0-9]:[0-5][0-9]$' THEN RETURN false; END IF;
  IF p_day_of_week IS NOT NULL AND (p_day_of_week < 0 OR p_day_of_week > 6) THEN RETURN false; END IF;

  SELECT * INTO r FROM public.reservations
   WHERE suivi_id = p_key
      OR tracking_id = p_key
      OR (p_key ~ '^[0-9a-fA-F-]{36}$' AND id::text = lower(p_key))
   LIMIT 1;

  IF r.id IS NULL THEN RETURN false; END IF;

  -- one active recurring request per source reservation
  IF EXISTS (SELECT 1 FROM public.recurring_rides WHERE source_reservation_id = r.id) THEN
    RETURN true;
  END IF;

  INSERT INTO public.recurring_rides (
    source_reservation_id, depart, destination, nb_passagers, nb_bagages,
    mode_paiement, client_name, frequency, day_of_week, time_hhmm, active
  ) VALUES (
    r.id,
    left(r.depart, 300),
    left(COALESCE(r.destination, r.arrivee), 300),
    LEAST(GREATEST(COALESCE(r.nb_passagers, r.passagers, 1), 1), 8),
    LEAST(GREATEST(COALESCE(r.bagages, 0), 0), 12),
    left(COALESCE(r.paiement, 'cb'), 30),
    left(COALESCE(r.client_name, r.nom, ''), 120),
    p_frequency, p_day_of_week, p_time_hhmm, true
  );
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.request_recurring_ride(text, text, smallint, text) TO anon, authenticated;

-- 3. site_analytics / cta_events: no direct anonymous writes
DROP POLICY IF EXISTS "Public can log analytics" ON public.site_analytics;
REVOKE INSERT ON public.site_analytics FROM anon, authenticated;

DROP POLICY IF EXISTS "Public can log CTA click" ON public.cta_events;
REVOKE INSERT ON public.cta_events FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.log_site_event(
  p_event text,
  p_session_id text,
  p_page text DEFAULT NULL,
  p_referrer text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_recent int;
BEGIN
  IF p_event IS NULL OR char_length(p_event) < 1 OR char_length(p_event) > 100 THEN RETURN false; END IF;
  IF p_session_id IS NULL OR char_length(p_session_id) < 3 OR char_length(p_session_id) > 100 THEN RETURN false; END IF;

  SELECT count(*) INTO v_recent
    FROM public.site_analytics
   WHERE session_id = p_session_id
     AND created_at > now() - interval '1 minute';
  IF v_recent >= 60 THEN RETURN false; END IF;

  INSERT INTO public.site_analytics (event, session_id, page, referrer)
  VALUES (p_event, p_session_id, left(COALESCE(p_page, ''), 500), left(COALESCE(p_referrer, ''), 1000));
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.log_site_event(text, text, text, text) TO anon, authenticated;