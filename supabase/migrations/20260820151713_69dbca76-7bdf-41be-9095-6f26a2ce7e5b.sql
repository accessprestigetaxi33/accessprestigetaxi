CREATE TABLE public.devis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  depart TEXT NOT NULL,
  arrivee TEXT NOT NULL,
  date_souhaitee DATE,
  heure_souhaitee TEXT,
  aller_retour BOOLEAN NOT NULL DEFAULT false,
  passagers INTEGER NOT NULL DEFAULT 1,
  bagages INTEGER NOT NULL DEFAULT 0,
  vehicule TEXT,
  prestation TEXT,
  transport_sanitaire BOOLEAN NOT NULL DEFAULT false,
  fauteuil_roulant BOOLEAN NOT NULL DEFAULT false,
  transport_groupe BOOLEAN NOT NULL DEFAULT false,
  sieges_enfant BOOLEAN NOT NULL DEFAULT false,
  distance_km NUMERIC,
  prix_estime NUMERIC,
  precisions TEXT,
  langue TEXT NOT NULL DEFAULT 'fr',
  statut TEXT NOT NULL DEFAULT 'recu',
  reponse TEXT,
  prix_propose NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.devis TO service_role;

ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;

CREATE INDEX devis_reference_idx ON public.devis (reference);

CREATE TRIGGER update_devis_updated_at
BEFORE UPDATE ON public.devis
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();