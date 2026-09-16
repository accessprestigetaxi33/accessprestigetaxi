REVOKE EXECUTE ON FUNCTION public.get_price_history_for_suivi(text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_price_history_for_suivi(text) TO service_role;