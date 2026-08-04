// Backend Access Prestige Taxi (Lovable Cloud).
//
// Historiquement ce module pointait vers le projet Supabase d'Allo Taxi Bordeaux.
// Access Prestige Taxi possède désormais SA PROPRE base (Lovable Cloud) où sont
// écrites les réservations, les messages, la position GPS et l'analytics.
// On redirige donc tous les appels serveur vers ce backend-là, ce qui garantit
// que /suivi/$id, /fin/$id et les e-mails lisent bien les mêmes données que le
// formulaire de réservation.
import { supabaseAdmin } from"@/integrations/supabase/client.server";

export function getTaxiSupabaseConfig() {
 const supabaseUrl = process.env.SUPABASE_URL;
 const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
 if (!supabaseUrl ||!serviceKey) {
 throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY for Access Prestige Taxi backend");
 }
 const targetRef = (() => {
 try {
 return new URL(supabaseUrl).hostname.split(".")[0] || null;
 } catch {
 return null;
 }
 })();
 return { supabaseUrl, serviceKey, targetRef, selectedKeyName:"SUPABASE_SERVICE_ROLE_KEY"selectedRef: targetRef };
}

export function getTaxiSupabaseAdmin() {
 return supabaseAdmin;
}
