-- A Web Push token may be reused by the same browser for multiple audiences.
-- The endpoint remains the stable device/target identity and is already unique.
-- The legacy uniqueness on (fcm_token) and (fcm_token, audience) incorrectly
-- assumes a token belongs to only one audience, which breaks multi-audience
-- browser/device setups (for example client + chauffeur on the same device).
DROP INDEX IF EXISTS public.push_subscriptions_fcm_token_unique;
ALTER TABLE public.push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_fcm_token_audience_key;