-- L'alerte "nouvelle réservation" est désormais envoyée par le code serveur via Resend.
-- Le déclencheur ne dépose plus rien dans la file d'attente e-mail (plus aucun
-- consommateur depuis la sortie de Lovable Cloud) : il devient inerte.
CREATE OR REPLACE FUNCTION public.trg_notify_new_reservation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- DEPRECATED: conservé pour compatibilité. L'envoi réel est fait côté serveur
  -- (bookRide, tick des trajets récurrents) directement via Resend.
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.trg_notify_new_reservation() IS 'DEPRECATED: inerte depuis la sortie de Lovable Cloud; les alertes partent du serveur via Resend.';
COMMENT ON FUNCTION public.enqueue_email(text, jsonb) IS 'DEPRECATED: file e-mail sans consommateur; utiliser sendTemplateEmail/sendRawEmail (Resend).';