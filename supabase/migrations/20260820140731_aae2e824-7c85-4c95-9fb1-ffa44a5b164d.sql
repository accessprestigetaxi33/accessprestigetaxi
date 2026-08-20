ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

UPDATE public.push_subscriptions
SET expires_at = COALESCE(last_seen_at, created_at, now()) + interval '50 days'
WHERE expires_at IS NULL;

ALTER TABLE public.push_subscriptions
  ALTER COLUMN expires_at SET NOT NULL,
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '50 days');

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_expires_at
  ON public.push_subscriptions (expires_at);

DROP POLICY IF EXISTS "Service role can delete expired push subs" ON public.push_subscriptions;
DO $$ BEGIN
  CREATE POLICY "Service role can delete expired push subs"
    ON public.push_subscriptions FOR DELETE
    TO service_role
    USING (expires_at < now());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
