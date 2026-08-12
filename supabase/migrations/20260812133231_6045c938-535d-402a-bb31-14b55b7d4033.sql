REVOKE EXECUTE ON FUNCTION public.log_site_event(text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_tracking_event(text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.request_recurring_ride(text, text, smallint, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_site_event(text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_tracking_event(text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.request_recurring_ride(text, text, smallint, text) TO service_role;