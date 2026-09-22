// Client Supabase public (anon) — backend Access Prestige Taxi (Lovable Cloud).
// Utilisé côté client pour le Realtime des pages de suivi.
import { supabase } from "@/lib/nova-supabase";

export function getTaxiSupabase() {
  return supabase;
}
