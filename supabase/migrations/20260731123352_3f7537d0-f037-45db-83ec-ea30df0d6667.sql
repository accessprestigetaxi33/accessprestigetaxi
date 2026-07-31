CREATE TABLE public.driver_profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.driver_profiles TO service_role;

ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_driver_profiles_updated_at
BEFORE UPDATE ON public.driver_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.driver_profiles (id, name, phone, active, sort_order) VALUES
  ('patricia', 'Patricia', '0650260015', true, 1),
  ('alain', 'Alain', '0650321923', true, 2)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.assign_driver_round_robin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_last text;
  v_ids text[];
  v_idx int;
  v_next text;
BEGIN
  IF NEW.assigned_driver IS NULL THEN
    SELECT array_agg(id ORDER BY sort_order, id) INTO v_ids
      FROM public.driver_profiles WHERE active;

    IF v_ids IS NULL OR array_length(v_ids, 1) = 0 THEN
      NEW.assigned_driver := 'patricia';
      RETURN NEW;
    END IF;

    SELECT last_driver INTO v_last FROM public.driver_rotation WHERE id = 1;
    v_idx := COALESCE(array_position(v_ids, v_last), 0);
    v_next := v_ids[(v_idx % array_length(v_ids, 1)) + 1];

    UPDATE public.driver_rotation
       SET last_driver = v_next, updated_at = now()
     WHERE id = 1;

    NEW.assigned_driver := v_next;
  END IF;
  RETURN NEW;
END;
$function$;