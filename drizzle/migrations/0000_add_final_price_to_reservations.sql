ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS final_price numeric(8,2),
  ADD COLUMN IF NOT EXISTS invoice_sent_at timestamptz;