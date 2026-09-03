CREATE OR REPLACE FUNCTION public.get_price_history_for_suivi(p_key text)
RETURNS TABLE(id uuid, old_price numeric, new_price numeric, motif text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.id,
         NULLIF(e.from_value, '')::numeric AS old_price,
         NULLIF(e.to_value, '')::numeric   AS new_price,
         NULL::text                        AS motif,
         e.created_at
  FROM public.reservation_events e
  JOIN public.reservations r ON r.id = e.reservation_id
  WHERE e.event_type = 'price'
    AND e.to_value ~ '^[0-9]+(\.[0-9]+)?$'
    AND (
      r.suivi_id = p_key
      OR r.tracking_id = p_key
      OR (p_key ~ '^[0-9a-fA-F-]{36}$' AND r.id::text = lower(p_key))
    )
  ORDER BY e.created_at ASC
$$;

GRANT EXECUTE ON FUNCTION public.get_price_history_for_suivi(text) TO anon, authenticated, service_role;