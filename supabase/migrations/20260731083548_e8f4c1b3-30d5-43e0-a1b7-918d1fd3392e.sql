-- site_analytics
CREATE TABLE IF NOT EXISTS public.site_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  session_id text,
  page text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.site_analytics TO anon, authenticated;
GRANT SELECT ON public.site_analytics TO authenticated;
GRANT ALL ON public.site_analytics TO service_role;
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_site_analytics_event_created ON public.site_analytics(event, created_at);

-- clients
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  total_courses integer NOT NULL DEFAULT 0,
  total_depense numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- courses
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  depart text,
  destination text,
  prix_final numeric(8,2),
  paiement text NOT NULL DEFAULT 'especes',
  status text NOT NULL DEFAULT 'en_cours',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_courses_created ON public.courses(created_at DESC);

-- reservations: colonnes supplémentaires
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS client_name text,
  ADD COLUMN IF NOT EXISTS client_phone text,
  ADD COLUMN IF NOT EXISTS client_email text,
  ADD COLUMN IF NOT EXISTS destination text,
  ADD COLUMN IF NOT EXISTS distance_km numeric(8,2),
  ADD COLUMN IF NOT EXISTS date_course text,
  ADD COLUMN IF NOT EXISTS heure_course text,
  ADD COLUMN IF NOT EXISTS nb_passagers integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS tarif_jour boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS prix_estime numeric(8,2),
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'form',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS tracking_id text,
  ADD COLUMN IF NOT EXISTS suivi_id text,
  ADD COLUMN IF NOT EXISTS refus_motif text,
  ADD COLUMN IF NOT EXISTS paiement text,
  ADD COLUMN IF NOT EXISTS route_coords jsonb,
  ADD COLUMN IF NOT EXISTS route_label text;

CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_created ON public.reservations(created_at DESC);
CREATE INDEX IF NOT EXISTS reservations_tracking_id_idx ON public.reservations(tracking_id);
CREATE INDEX IF NOT EXISTS reservations_suivi_id_idx ON public.reservations(suivi_id);

-- driver_gps
ALTER TABLE public.driver_gps
  ADD COLUMN IF NOT EXISTS destination text,
  ADD COLUMN IF NOT EXISTS prix_estime text;

INSERT INTO public.driver_gps (id, is_active) VALUES ('driver', false)
  ON CONFLICT (id) DO NOTHING;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;

-- app_settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id integer PRIMARY KEY DEFAULT 1,
  tracking_mode text NOT NULL DEFAULT 'single' CHECK (tracking_mode IN ('single','multi')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_settings_singleton CHECK (id = 1)
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
INSERT INTO public.app_settings (id, tracking_mode) VALUES (1, 'single') ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read app_settings" ON public.app_settings;
CREATE POLICY "Anyone can read app_settings" ON public.app_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can update app_settings" ON public.app_settings;
CREATE POLICY "Admins can update app_settings" ON public.app_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert app_settings" ON public.app_settings;
CREATE POLICY "Admins can insert app_settings" ON public.app_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- email log idempotency
ALTER TABLE public.email_send_log ADD COLUMN IF NOT EXISTS idempotency_key text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_send_log_idem_unique
  ON public.email_send_log (idempotency_key)
  WHERE idempotency_key IS NOT NULL AND status <> 'failed';

-- push_subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audience text NOT NULL CHECK (audience IN ('admin','chauffeur','client')),
  endpoint text NOT NULL UNIQUE,
  p256dh text,
  auth text,
  fcm_token text,
  user_id uuid,
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE CASCADE,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.push_subscriptions TO anon, authenticated;
GRANT SELECT, UPDATE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_audience ON public.push_subscriptions(audience);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_reservation ON public.push_subscriptions(reservation_id);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read push subs" ON public.push_subscriptions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update push subs" ON public.push_subscriptions FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policies durcies (état final des fichiers 019-026)
DROP POLICY IF EXISTS "Admins can read clients" ON public.clients;
CREATE POLICY "Admins can read clients" ON public.clients FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update clients" ON public.clients FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete clients" ON public.clients FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read courses" ON public.courses FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert courses" ON public.courses FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update courses" ON public.courses FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete courses" ON public.courses FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read analytics" ON public.site_analytics FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can log analytics" ON public.site_analytics FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(event) BETWEEN 1 AND 100
    AND (page IS NULL OR char_length(page) <= 500)
    AND (referrer IS NULL OR char_length(referrer) <= 1000)
    AND (session_id IS NULL OR char_length(session_id) <= 100)
  );

DROP POLICY IF EXISTS "Anyone can log a CTA click" ON public.cta_events;
CREATE POLICY "Public can log CTA click" ON public.cta_events FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(event_type) BETWEEN 1 AND 50
    AND (variant IS NULL OR char_length(variant) <= 50)
    AND (page IS NULL OR char_length(page) <= 500)
    AND (referrer IS NULL OR char_length(referrer) <= 1000)
    AND (lang IS NULL OR char_length(lang) <= 10)
    AND (user_agent IS NULL OR char_length(user_agent) <= 1000)
  );

CREATE POLICY "Public can subscribe to push" ON public.push_subscriptions FOR INSERT TO anon, authenticated
  WITH CHECK (
    audience IN ('admin','chauffeur','client')
    AND char_length(endpoint) BETWEEN 5 AND 2000
    AND (fcm_token IS NULL OR char_length(fcm_token) BETWEEN 50 AND 500)
    AND (user_agent IS NULL OR char_length(user_agent) <= 1000)
  );

DROP POLICY IF EXISTS "Anyone can create reservation" ON public.reservations;
DROP POLICY IF EXISTS "Public can insert reservations" ON public.reservations;
CREATE POLICY "Public can create reservation" ON public.reservations FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(nom) BETWEEN 1 AND 200
    AND char_length(telephone) BETWEEN 5 AND 30
    AND char_length(depart) BETWEEN 1 AND 500
    AND char_length(arrivee) BETWEEN 1 AND 500
    AND passagers BETWEEN 1 AND 12
    AND (bagages IS NULL OR bagages BETWEEN 0 AND 20)
    AND (email IS NULL OR char_length(email) <= 320)
    AND (message IS NULL OR char_length(message) <= 2000)
  );

DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- RPC de suivi
CREATE OR REPLACE FUNCTION public.get_reservation_by_tracking(p_tracking_id text)
RETURNS TABLE(
  id uuid, nom text, telephone text, email text,
  pickup_datetime timestamp with time zone,
  depart text, arrivee text, destination text,
  passagers integer, nb_passagers integer, bagages integer,
  service_type text, message text, status text,
  tracking_id text, distance_km numeric, prix_estime numeric,
  client_name text, client_phone text, client_email text,
  date_course text, heure_course text,
  created_at timestamp with time zone
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, nom, telephone, email, pickup_datetime, depart, arrivee, destination,
         passagers, nb_passagers, bagages, service_type, message, status,
         tracking_id, distance_km, prix_estime,
         client_name, client_phone, client_email,
         date_course, heure_course, created_at
  FROM public.reservations
  WHERE tracking_id = p_tracking_id
  LIMIT 1
$$;
REVOKE EXECUTE ON FUNCTION public.get_reservation_by_tracking(text) FROM PUBLIC, anon, authenticated;

ALTER FUNCTION public.has_role(uuid, public.app_role) SECURITY INVOKER;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

DROP FUNCTION IF EXISTS public.get_reservation_public(uuid);
DROP FUNCTION IF EXISTS public.cancel_reservation_public(uuid);

-- Notification e-mail interne à la création d'une réservation
CREATE OR REPLACE FUNCTION public.trg_notify_new_reservation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id text := gen_random_uuid()::text;
  v_idem text := 'reservation-' || NEW.id::text;
  v_subject text;
  v_when text;
  v_html text;
  v_text text;
  v_to text := 'contact@accesprestigetaxi.fr';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.email_send_log
    WHERE message_id LIKE 'reservation-' || NEW.id::text || '%'
       OR (template_name = 'new-reservation-admin' AND recipient_email = v_to
           AND created_at > now() - interval '1 hour'
           AND error_message IS NULL
           AND status IN ('pending','sent'))
  ) THEN
    RETURN NEW;
  END IF;

  v_when := to_char(NEW.pickup_datetime AT TIME ZONE 'Europe/Paris', 'DD/MM/YYYY HH24:MI');
  v_subject := 'Nouvelle reservation — ' || COALESCE(NEW.nom, 'Client');

  v_html := concat(
    '<!doctype html><html><body style="font-family:Arial,sans-serif;background:#fff;color:#111;">',
    '<div style="max-width:560px;padding:24px;">',
    '<h1 style="font-size:22px;margin:0 0 12px;">Nouvelle réservation</h1>',
    '<div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:8px;padding:16px 18px;font-size:14px;line-height:1.6;">',
    '<p><b>Client :</b> ', COALESCE(NEW.nom,'—'), '</p>',
    '<p><b>Téléphone :</b> ', COALESCE(NEW.telephone,'—'), '</p>',
    '<p><b>Email :</b> ', COALESCE(NEW.email,'—'), '</p>',
    '<p><b>Date / heure :</b> ', v_when, '</p>',
    '<p><b>Départ :</b> ', COALESCE(NEW.depart,'—'), '</p>',
    '<p><b>Arrivée :</b> ', COALESCE(NEW.arrivee,'—'), '</p>',
    '<p><b>Passagers :</b> ', COALESCE(NEW.passagers::text,'1'), '</p>',
    '<p><b>Bagages :</b> ', COALESCE(NEW.bagages::text,'0'), '</p>',
    '</div></div></body></html>'
  );

  v_text := concat(
    'Nouvelle reservation', E'\n',
    'Client: ', COALESCE(NEW.nom,'—'), E'\n',
    'Telephone: ', COALESCE(NEW.telephone,'—'), E'\n',
    'Email: ', COALESCE(NEW.email,'—'), E'\n',
    'Date/heure: ', v_when, E'\n',
    'Depart: ', COALESCE(NEW.depart,'—'), E'\n',
    'Arrivee: ', COALESCE(NEW.arrivee,'—')
  );

  INSERT INTO public.email_send_log (message_id, template_name, recipient_email, status)
  VALUES (v_message_id, 'new-reservation-admin', v_to, 'pending');

  PERFORM public.enqueue_email(
    'transactional_emails',
    jsonb_build_object(
      'message_id', v_message_id,
      'to', v_to,
      'subject', v_subject,
      'html', v_html,
      'text', v_text,
      'purpose', 'transactional',
      'label', 'new-reservation-admin',
      'idempotency_key', v_idem,
      'queued_at', now()
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.trg_notify_new_reservation() FROM PUBLIC, anon, authenticated;