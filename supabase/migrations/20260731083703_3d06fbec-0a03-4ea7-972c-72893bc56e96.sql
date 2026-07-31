DROP TRIGGER IF EXISTS notify_admin_on_new_reservation ON public.reservations;
DROP TRIGGER IF EXISTS notify_reservation_http_on_insert ON public.reservations;
DROP TRIGGER IF EXISTS trg_notify_reservation_http ON public.reservations;

-- driver_gps grants
REVOKE DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.driver_gps FROM anon;
REVOKE DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.driver_gps FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.driver_gps TO anon;
GRANT SELECT, INSERT, UPDATE ON public.driver_gps TO authenticated;
GRANT ALL ON public.driver_gps TO service_role;

ALTER TABLE public.driver_gps ADD COLUMN IF NOT EXISTS heartbeat_at timestamptz;
UPDATE public.driver_gps SET heartbeat_at = COALESCE(heartbeat_at, updated_at, now()) WHERE id = 'driver';

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS gps_validated_at timestamptz,
  ADD COLUMN IF NOT EXISTS phone_cancel_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS duree_s integer,
  ADD COLUMN IF NOT EXISTS reminder_j1_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_reservations_reminder_j1
  ON public.reservations (pickup_datetime, status) WHERE reminder_j1_sent_at IS NULL;

CREATE OR REPLACE FUNCTION public.mark_gps_validated(p_reservation_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_updated int;
BEGIN
  UPDATE public.reservations
     SET gps_validated_at = now()
   WHERE id = p_reservation_id
     AND gps_validated_at IS NULL
     AND status IN ('accepted','en_route','arrived');
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;
GRANT EXECUTE ON FUNCTION public.mark_gps_validated(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_reservation_for_suivi(p_key text)
RETURNS SETOF public.reservations
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT *
  FROM public.reservations
  WHERE suivi_id = p_key
     OR tracking_id = p_key
     OR (p_key ~ '^[0-9a-fA-F-]{36}$' AND id::text = lower(p_key))
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_reservation_for_suivi(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Comptes clients
CREATE TABLE IF NOT EXISTS public.client_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  client_name TEXT,
  phone TEXT,
  company_name text,
  siret text,
  tva_intracom text,
  billing_address text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.client_accounts TO service_role;
ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role full access client_accounts"
ON public.client_accounts FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.client_account_secrets (
  client_account_id UUID NOT NULL PRIMARY KEY REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.client_account_secrets TO service_role;
ALTER TABLE public.client_account_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages client secrets"
  ON public.client_account_secrets FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS client_account_id UUID REFERENCES public.client_accounts(id);

-- Messagerie réservation
CREATE TABLE IF NOT EXISTS public.reservation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('client','chauffeur')),
  content TEXT NOT NULL,
  read_by_client BOOLEAN NOT NULL DEFAULT false,
  read_by_chauffeur BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reservation_messages_resa_created_idx
  ON public.reservation_messages(reservation_id, created_at DESC);
GRANT SELECT, UPDATE, DELETE ON public.reservation_messages TO authenticated;
GRANT ALL ON public.reservation_messages TO service_role;
ALTER TABLE public.reservation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read reservation messages" ON public.reservation_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update reservation messages" ON public.reservation_messages
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete reservation messages" ON public.reservation_messages
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "service role manages reservation messages" ON public.reservation_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Messagerie directe
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_account_id uuid NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('client','chauffeur')),
  content text NOT NULL,
  read_by_client boolean NOT NULL DEFAULT false,
  read_by_chauffeur boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_direct_messages_account_created
  ON public.direct_messages (client_account_id, created_at DESC);
GRANT ALL ON public.direct_messages TO service_role;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages direct messages" ON public.direct_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Favoris
CREATE TABLE IF NOT EXISTS public.client_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  label text NOT NULL,
  address text NOT NULL,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.client_favorites TO service_role;
ALTER TABLE public.client_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages favorites" ON public.client_favorites
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_client_favorites_client ON public.client_favorites(client_id, sort_order);
CREATE TRIGGER update_client_favorites_updated_at
  BEFORE UPDATE ON public.client_favorites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Réinitialisation mot de passe
CREATE TABLE IF NOT EXISTS public.client_password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_account_id uuid NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS client_password_resets_token_idx ON public.client_password_resets(token_hash);
CREATE INDEX IF NOT EXISTS client_password_resets_account_idx ON public.client_password_resets(client_account_id);
GRANT ALL ON public.client_password_resets TO service_role;
ALTER TABLE public.client_password_resets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages password resets" ON public.client_password_resets
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Trajets récurrents
CREATE TABLE IF NOT EXISTS public.client_recurring_rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_account_id uuid NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  label text NOT NULL,
  depart text NOT NULL,
  destination text NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  hour smallint NOT NULL CHECK (hour BETWEEN 0 AND 23),
  minute smallint NOT NULL DEFAULT 0 CHECK (minute BETWEEN 0 AND 59),
  passagers smallint NOT NULL DEFAULT 1 CHECK (passagers BETWEEN 1 AND 8),
  bagages smallint NOT NULL DEFAULT 0 CHECK (bagages BETWEEN 0 AND 8),
  paiement text NOT NULL DEFAULT 'cb',
  message text NULL,
  active boolean NOT NULL DEFAULT true,
  next_run_at timestamptz NOT NULL,
  last_run_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS client_recurring_rides_account_idx ON public.client_recurring_rides(client_account_id);
CREATE INDEX IF NOT EXISTS client_recurring_rides_next_run_idx ON public.client_recurring_rides(next_run_at) WHERE active;
GRANT ALL ON public.client_recurring_rides TO service_role;
ALTER TABLE public.client_recurring_rides ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_client_recurring_rides_updated
  BEFORE UPDATE ON public.client_recurring_rides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "service role manages recurring rides" ON public.client_recurring_rides
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Journal des échecs push
CREATE TABLE IF NOT EXISTS public.push_send_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  audience text NOT NULL,
  tag text,
  reservation_id uuid,
  fcm_token_suffix text,
  http_status int,
  error_code text,
  title text,
  body text,
  user_agent text
);
GRANT SELECT ON public.push_send_failures TO authenticated;
GRANT ALL ON public.push_send_failures TO service_role;
ALTER TABLE public.push_send_failures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_push_failures" ON public.push_send_failures
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX IF NOT EXISTS idx_push_send_failures_created_at ON public.push_send_failures (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_send_failures_tag ON public.push_send_failures (tag);

-- Désinscription push
CREATE OR REPLACE FUNCTION public.unsubscribe_push(p_endpoint text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_count int;
BEGIN
  IF p_endpoint IS NULL OR char_length(p_endpoint) < 5 OR char_length(p_endpoint) > 2000 THEN
    RETURN false;
  END IF;
  DELETE FROM public.push_subscriptions WHERE endpoint = p_endpoint;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;
REVOKE ALL ON FUNCTION public.unsubscribe_push(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unsubscribe_push(text) TO anon, authenticated;

-- Politique push affinée
DROP POLICY IF EXISTS "Public can subscribe to push" ON public.push_subscriptions;
CREATE POLICY "Public can subscribe as client" ON public.push_subscriptions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    audience = 'client'
    AND char_length(endpoint) BETWEEN 5 AND 2000
    AND (fcm_token IS NULL OR (char_length(fcm_token) BETWEEN 50 AND 500))
    AND (user_agent IS NULL OR char_length(user_agent) <= 1000)
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;