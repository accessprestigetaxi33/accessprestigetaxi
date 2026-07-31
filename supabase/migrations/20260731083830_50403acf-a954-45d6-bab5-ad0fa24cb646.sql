-- Langue client + recalcul durées
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS lang text,
  ADD COLUMN IF NOT EXISTS duree_recomputed_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_reservations_duree_recompute_queue
  ON public.reservations (pickup_datetime DESC)
  WHERE duree_recomputed_at IS NULL
    AND status NOT IN ('completed','cancelled','annulee');

-- push_subscriptions : lien compte client + dédup
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS client_account_id uuid REFERENCES public.client_accounts(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_client_account
  ON public.push_subscriptions(client_account_id)
  WHERE audience = 'client' AND client_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_client_target
  ON public.push_subscriptions(audience, reservation_id, client_account_id)
  WHERE audience = 'client';
CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_fcm_token_unique
  ON public.push_subscriptions (fcm_token) WHERE fcm_token IS NOT NULL;
ALTER TABLE public.push_subscriptions
  ADD CONSTRAINT push_subscriptions_fcm_token_audience_key UNIQUE (fcm_token, audience);

GRANT INSERT ON public.push_subscriptions TO anon, authenticated;
GRANT SELECT, UPDATE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;

DROP POLICY IF EXISTS "Public can subscribe as client" ON public.push_subscriptions;
CREATE POLICY "Admins can register chauffeur push devices"
  ON public.push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (
    audience = 'chauffeur'
    AND public.has_role(auth.uid(), 'admin'::app_role)
    AND char_length(endpoint) BETWEEN 5 AND 2000
    AND (fcm_token IS NULL OR char_length(fcm_token) BETWEEN 50 AND 500)
    AND (user_agent IS NULL OR char_length(user_agent) <= 1000)
  );

-- Visiteurs actifs
CREATE TABLE IF NOT EXISTS public.active_visitors (
  session_id text PRIMARY KEY,
  page text,
  last_seen timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.active_visitors TO anon, authenticated;
GRANT ALL ON public.active_visitors TO service_role;
ALTER TABLE public.active_visitors ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_active_visitors_last_seen ON public.active_visitors(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_active_visitors_page ON public.active_visitors(page);

CREATE POLICY "Deny direct select on active_visitors" ON public.active_visitors FOR SELECT USING (false);
CREATE POLICY "Anyone can upsert their visitor row" ON public.active_visitors
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Delete only stale visitor rows" ON public.active_visitors
  FOR DELETE TO anon, authenticated USING (last_seen < now() - interval '2 minutes');

CREATE OR REPLACE FUNCTION public.get_active_visitor_count(p_scope text DEFAULT 'site')
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.active_visitors
  WHERE last_seen >= (now() - interval '90 seconds')
    AND (p_scope = 'site' OR (p_scope = 'suivi' AND page LIKE '/suivi%'));
$$;
REVOKE ALL ON FUNCTION public.get_active_visitor_count(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_visitor_count(text) TO anon, authenticated;

-- Dédup push
CREATE TABLE IF NOT EXISTS public.push_dedup (
  tag text NOT NULL,
  audience text NOT NULL,
  first_sent_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (tag, audience)
);
CREATE INDEX IF NOT EXISTS push_dedup_expires_idx ON public.push_dedup (expires_at);
GRANT ALL ON public.push_dedup TO service_role;
ALTER TABLE public.push_dedup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_dedup_no_public_access" ON public.push_dedup FOR ALL
  TO anon, authenticated USING (false) WITH CHECK (false);

-- Avis
CREATE TABLE IF NOT EXISTS public.avis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  note smallint NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire text,
  reservation_id uuid,
  chauffeur_id uuid,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.avis TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avis TO authenticated;
GRANT ALL ON public.avis TO service_role;
ALTER TABLE public.avis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a review" ON public.avis FOR INSERT
  TO anon, authenticated WITH CHECK (status = 'pending');
CREATE POLICY "Anyone can read approved reviews" ON public.avis FOR SELECT
  TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Admins can read all reviews" ON public.avis FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reviews" ON public.avis FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reviews" ON public.avis FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
ALTER PUBLICATION supabase_realtime ADD TABLE public.avis;

-- Synchronisation reviews -> avis
CREATE OR REPLACE FUNCTION public.sync_reviews_to_avis()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    DELETE FROM public.avis WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  INSERT INTO public.avis (id, author_name, note, commentaire, status, created_at)
  VALUES (NEW.id, NEW.name, NEW.rating, NEW.text,
          CASE WHEN NEW.approved THEN 'approved' ELSE 'pending' END, NEW.created_at)
  ON CONFLICT (id) DO UPDATE
    SET author_name = EXCLUDED.author_name,
        note        = EXCLUDED.note,
        commentaire = EXCLUDED.commentaire,
        status      = EXCLUDED.status,
        created_at  = EXCLUDED.created_at;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_reviews_to_avis() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_sync_reviews_to_avis_ins ON public.reviews;
DROP TRIGGER IF EXISTS trg_sync_reviews_to_avis_upd ON public.reviews;
DROP TRIGGER IF EXISTS trg_sync_reviews_to_avis_del ON public.reviews;
CREATE TRIGGER trg_sync_reviews_to_avis_ins AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.sync_reviews_to_avis();
CREATE TRIGGER trg_sync_reviews_to_avis_upd AFTER UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.sync_reviews_to_avis();
CREATE TRIGGER trg_sync_reviews_to_avis_del AFTER DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.sync_reviews_to_avis();

INSERT INTO public.avis (id, author_name, note, commentaire, status, created_at)
SELECT r.id, r.name, r.rating, r.text,
       CASE WHEN r.approved THEN 'approved' ELSE 'pending' END, r.created_at
FROM public.reviews r
ON CONFLICT (id) DO NOTHING;

-- driver_gps / driver_location : lecture admin uniquement
DROP POLICY IF EXISTS "Public can read driver gps" ON public.driver_gps;
CREATE POLICY "Admins can read driver gps" ON public.driver_gps FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.driver_gps FROM anon;

DROP POLICY IF EXISTS "Public can read driver location" ON public.driver_location;
CREATE POLICY "Admins can read driver location" ON public.driver_location FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.driver_location FROM anon;

REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

-- Messages lus par le chauffeur
CREATE OR REPLACE FUNCTION public.mark_reservation_read_by_chauffeur(p_reservation_id uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_count integer;
BEGIN
  UPDATE public.reservation_messages
     SET read_by_chauffeur = true
   WHERE reservation_id = p_reservation_id
     AND sender = 'client'
     AND read_by_chauffeur = false;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
REVOKE ALL ON FUNCTION public.mark_reservation_read_by_chauffeur(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_reservation_read_by_chauffeur(uuid) TO service_role;

-- Realtime messages réservation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'reservation_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.reservation_messages';
  END IF;
END $$;
ALTER TABLE public.reservation_messages REPLICA IDENTITY FULL;

-- Retirer clients/courses de la publication temps réel
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='clients') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.clients';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='courses') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.courses';
  END IF;
END $$;

-- Verrouillage fonctions internes
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.mark_gps_validated(uuid) FROM anon, PUBLIC;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role, anon;
NOTIFY pgrst, 'reload schema';