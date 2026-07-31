ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS assigned_driver text;

CREATE TABLE IF NOT EXISTS public.driver_rotation (
  id integer PRIMARY KEY,
  last_driver text NOT NULL DEFAULT 'alain',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.driver_rotation TO service_role;
ALTER TABLE public.driver_rotation ENABLE ROW LEVEL SECURITY;
INSERT INTO public.driver_rotation (id, last_driver) VALUES (1, 'alain') ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.assign_driver_round_robin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_next text;
BEGIN
  IF NEW.assigned_driver IS NULL THEN
    UPDATE public.driver_rotation
       SET last_driver = CASE WHEN last_driver = 'patricia' THEN 'alain' ELSE 'patricia' END,
           updated_at = now()
     WHERE id = 1
    RETURNING last_driver INTO v_next;
    NEW.assigned_driver := COALESCE(v_next, 'patricia');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_driver_round_robin ON public.reservations;
CREATE TRIGGER trg_assign_driver_round_robin
BEFORE INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.assign_driver_round_robin();

WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM public.reservations
  WHERE assigned_driver IS NULL
)
UPDATE public.reservations r
   SET assigned_driver = CASE WHEN ranked.rn % 2 = 1 THEN 'patricia' ELSE 'alain' END
  FROM ranked
 WHERE r.id = ranked.id;