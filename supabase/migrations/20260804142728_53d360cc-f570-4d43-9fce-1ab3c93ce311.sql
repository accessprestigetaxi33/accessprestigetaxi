CREATE TABLE IF NOT EXISTS public.push_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  channel text NOT NULL DEFAULT 'push',
  audience text NOT NULL,
  status text NOT NULL,
  tag text,
  reservation_id uuid,
  recipient text,
  fcm_token_suffix text,
  http_status integer,
  error_code text,
  title text,
  body text,
  user_agent text
);

CREATE INDEX IF NOT EXISTS push_send_log_created_idx ON public.push_send_log (created_at DESC);
CREATE INDEX IF NOT EXISTS push_send_log_res_idx ON public.push_send_log (reservation_id);

GRANT ALL ON public.push_send_log TO service_role;
ALTER TABLE public.push_send_log ENABLE ROW LEVEL SECURITY;