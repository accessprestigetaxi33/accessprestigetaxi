-- Fix: force all new public reviews into moderation
-- 1) New rows default to not approved
ALTER TABLE public.reviews ALTER COLUMN approved SET DEFAULT false;

-- 2) Recreate the public insert policy so a submitted review can never be instantly visible
DROP POLICY "Anyone can submit a review" ON public.reviews;

CREATE POLICY "Anyone can submit a review"
ON public.reviews
FOR INSERT
TO public
WITH CHECK (
  approved = false
  AND char_length(name) >= 1 AND char_length(name) <= 80
  AND char_length(text) >= 1 AND char_length(text) <= 1000
  AND rating >= 1 AND rating <= 5
);