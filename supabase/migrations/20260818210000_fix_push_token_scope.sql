-- A Web Push token may be reused by the same browser for multiple audiences.
-- The endpoint remains the stable device/target identity and is already unique.
DROP INDEX IF EXISTS public.push_subscriptions_fcm_token_unique;
ALTER TABLE public.push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_fcm_token_audience_key;