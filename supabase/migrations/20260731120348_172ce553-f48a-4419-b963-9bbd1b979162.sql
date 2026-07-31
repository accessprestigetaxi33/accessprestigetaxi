CREATE TABLE public.reservation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  from_value text,
  to_value text,
  driver text,
  client_name text,
  depart text,
  destination text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservation_events_created_at ON public.reservation_events (created_at DESC);
CREATE INDEX idx_reservation_events_reservation ON public.reservation_events (reservation_id);

GRANT ALL ON public.reservation_events TO service_role;

ALTER TABLE public.reservation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservation_events_service_only"
  ON public.reservation_events FOR SELECT TO service_role USING (true);

CREATE OR REPLACE FUNCTION public.log_reservation_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.reservation_events (reservation_id, event_type, to_value, driver, client_name, depart, destination)
    VALUES (NEW.id, 'created', NEW.status, NEW.assigned_driver,
            COALESCE(NEW.client_name, NEW.nom), NEW.depart, COALESCE(NEW.destination, NEW.arrivee));
    RETURN NEW;
  END IF;

  IF NEW.assigned_driver IS DISTINCT FROM OLD.assigned_driver THEN
    INSERT INTO public.reservation_events (reservation_id, event_type, from_value, to_value, driver, client_name, depart, destination)
    VALUES (NEW.id, 'assigned', OLD.assigned_driver, NEW.assigned_driver, NEW.assigned_driver,
            COALESCE(NEW.client_name, NEW.nom), NEW.depart, COALESCE(NEW.destination, NEW.arrivee));
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.reservation_events (reservation_id, event_type, from_value, to_value, driver, client_name, depart, destination)
    VALUES (NEW.id, 'status', OLD.status, NEW.status, NEW.assigned_driver,
            COALESCE(NEW.client_name, NEW.nom), NEW.depart, COALESCE(NEW.destination, NEW.arrivee));
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_reservation_event_ins
  AFTER INSERT ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.log_reservation_event();

CREATE TRIGGER trg_log_reservation_event_upd
  AFTER UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.log_reservation_event();