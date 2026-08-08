-- 1) RLS activée partout (idempotent)
ALTER TABLE public.driver_gps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_account_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_recurring_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_events ENABLE ROW LEVEL SECURITY;

-- 2) Aucun accès Data API direct pour anon / authenticated : tout passe par les
--    server functions qui vérifient un jeton client (suivi_id) ou chauffeur.
REVOKE ALL ON public.driver_gps FROM anon, authenticated;
REVOKE ALL ON public.driver_location FROM anon, authenticated;
REVOKE ALL ON public.reservations FROM anon, authenticated;
REVOKE ALL ON public.reservation_messages FROM anon, authenticated;
REVOKE ALL ON public.direct_messages FROM anon, authenticated;
REVOKE ALL ON public.client_accounts FROM anon, authenticated;
REVOKE ALL ON public.client_sessions FROM anon, authenticated;
REVOKE ALL ON public.client_account_secrets FROM anon, authenticated;
REVOKE ALL ON public.client_favorites FROM anon, authenticated;
REVOKE ALL ON public.client_recurring_rides FROM anon, authenticated;
REVOKE ALL ON public.reservation_events FROM anon, authenticated;

GRANT ALL ON public.driver_gps TO service_role;
GRANT ALL ON public.driver_location TO service_role;
GRANT ALL ON public.reservations TO service_role;
GRANT ALL ON public.reservation_messages TO service_role;
GRANT ALL ON public.direct_messages TO service_role;
GRANT ALL ON public.client_accounts TO service_role;
GRANT ALL ON public.client_sessions TO service_role;
GRANT ALL ON public.client_account_secrets TO service_role;
GRANT ALL ON public.client_favorites TO service_role;
GRANT ALL ON public.client_recurring_rides TO service_role;
GRANT ALL ON public.reservation_events TO service_role;

-- 3) Politiques d'administration manquantes (complètude), réservées aux admins.
DROP POLICY IF EXISTS "Admins can delete driver gps" ON public.driver_gps;
CREATE POLICY "Admins can delete driver gps"
  ON public.driver_gps FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert reservation messages" ON public.reservation_messages;
CREATE POLICY "Admins can insert reservation messages"
  ON public.reservation_messages FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage direct messages" ON public.direct_messages;
CREATE POLICY "Admins manage direct messages"
  ON public.direct_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

COMMENT ON TABLE public.driver_gps IS 'Position chauffeur — fail-closed : lecture/écriture uniquement via server functions (service role) après vérification du jeton chauffeur ou de la clé de suivi.';
COMMENT ON TABLE public.reservations IS 'Réservations — fail-closed : aucun accès Data API direct ; server functions uniquement (jeton client, clé de suivi ou jeton chauffeur).';
COMMENT ON TABLE public.reservation_messages IS 'Conversations de course — fail-closed : server functions uniquement, après vérification du jeton client/chauffeur.';
COMMENT ON TABLE public.direct_messages IS 'Conversations espace client — fail-closed : server functions uniquement, après vérification de la session client ou du jeton chauffeur.';