-- 1. Client sessions (server-verified custom auth)
CREATE TABLE IF NOT EXISTS public.client_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_account_id uuid NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_client_sessions_account ON public.client_sessions(client_account_id);
GRANT ALL ON public.client_sessions TO service_role;
ALTER TABLE public.client_sessions ENABLE ROW LEVEL SECURITY;
-- no policies: only the service role (which bypasses RLS) may touch sessions

-- 2. app_settings: internal config, not public
DROP POLICY IF EXISTS "Anyone can read app_settings" ON public.app_settings;
CREATE POLICY "Admins can read app_settings"
  ON public.app_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
REVOKE SELECT ON public.app_settings FROM anon;
GRANT ALL ON public.app_settings TO service_role;

-- 3. avis: public submissions cannot claim a driver or a reservation
DROP POLICY IF EXISTS "Anyone can submit a review" ON public.avis;
CREATE POLICY "Anyone can submit a review"
  ON public.avis FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND reservation_id IS NULL
    AND chauffeur_id IS NULL
    AND char_length(author_name) BETWEEN 1 AND 80
    AND (commentaire IS NULL OR char_length(commentaire) <= 900)
    AND note BETWEEN 1 AND 5
  );

CREATE OR REPLACE FUNCTION public.validate_avis_reservation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.reservation_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.reservations r WHERE r.id = NEW.reservation_id) THEN
    RAISE EXCEPTION 'Unknown reservation for review';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_avis_reservation() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_validate_avis_reservation ON public.avis;
CREATE TRIGGER trg_validate_avis_reservation
  BEFORE INSERT OR UPDATE ON public.avis
  FOR EACH ROW EXECUTE FUNCTION public.validate_avis_reservation();

-- 4. reservations: public inserts cannot be attached to someone's account
DROP POLICY IF EXISTS "Public can create reservation" ON public.reservations;
CREATE POLICY "Public can create reservation"
  ON public.reservations FOR INSERT TO anon, authenticated
  WITH CHECK (
    client_account_id IS NULL
    AND char_length(nom) BETWEEN 1 AND 200
    AND char_length(telephone) BETWEEN 5 AND 30
    AND char_length(depart) BETWEEN 1 AND 500
    AND char_length(arrivee) BETWEEN 1 AND 500
    AND passagers BETWEEN 1 AND 12
    AND (bagages IS NULL OR bagages BETWEEN 0 AND 20)
    AND (email IS NULL OR char_length(email) <= 320)
    AND (message IS NULL OR char_length(message) <= 2000)
  );

-- 5. active_visitors: bound the anonymous insert
DROP POLICY IF EXISTS "Anyone can upsert their visitor row" ON public.active_visitors;
CREATE POLICY "Anyone can upsert their visitor row"
  ON public.active_visitors FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(session_id) BETWEEN 8 AND 100
    AND (page IS NULL OR char_length(page) <= 300)
    AND last_seen >= now() - interval '5 minutes'
    AND last_seen <= now() + interval '1 minute'
  );

-- 6. drop redundant always-true service_role policies (service_role bypasses RLS)
DROP POLICY IF EXISTS "service role manages client secrets" ON public.client_account_secrets;
DROP POLICY IF EXISTS "service role full access client_accounts" ON public.client_accounts;
DROP POLICY IF EXISTS "service role manages favorites" ON public.client_favorites;
DROP POLICY IF EXISTS "service role manages password resets" ON public.client_password_resets;
DROP POLICY IF EXISTS "service role manages recurring rides" ON public.client_recurring_rides;
DROP POLICY IF EXISTS "service role manages direct messages" ON public.direct_messages;
DROP POLICY IF EXISTS "service role manages reservation messages" ON public.reservation_messages;

-- 7. SECURITY DEFINER functions: not callable by anon/authenticated
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_gps_validated(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_reservation_read_by_chauffeur(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.unsubscribe_push(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_reservation_by_tracking(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_reservation_for_suivi(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_reviews_to_avis() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_notify_new_reservation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_gps_validated(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_reservation_read_by_chauffeur(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.unsubscribe_push(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_reservation_by_tracking(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_reservation_for_suivi(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- get_active_visitor_count stays callable by visitors (public live counter) but is read-only aggregate
GRANT EXECUTE ON FUNCTION public.get_active_visitor_count(text) TO anon, authenticated, service_role;