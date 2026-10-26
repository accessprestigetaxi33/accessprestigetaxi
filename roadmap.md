# Feuille de route — Espace chauffeur identique à Nova Taxi Prestige

- [x] Inventaire des dépendances de la page chauffeur Nova Taxi
- [x] Base externe : créer les tables manquantes (driver_accounts, driver_sessions, driver_expenses, accounting_settings, driver_chat, driver_unavailability) + colonnes reservations (driver_slug, overflow_*, started_at, completed_at, distance_reelle_km, duree_reelle_s, prix_final) + fonction verify_driver_password + buckets storage receipts/backups
- [x] Base externe : créer les comptes Alain et Patricia (jetons = codes existants)
- [x] Porter les modules serveur Nova (driver.functions, driver-ops, driver-extra, driver-accounting, ops.server, driver-session) en pointant sur le backend externe (@/lib/nova-supabase.server)
- [x] Porter les composants (driver/tabs, ClientCardsPage, OpsPages, SoundDebugPage, TeamMap) + hooks (useLiveGps, useAutoStatus, useReservationsRealtime) + lib leaflet/osrm/places/quote.functions/driverProfile/driver-shell-css
- [x] Remplacer src/routes/driver.tsx par la version Nova adaptée (logo Access Taxi PBR, tarifs du projet, noms)
- [ ] NE PAS toucher : config notifications push (usePushNotifications, push.functions, firebase)
- [ ] Vérifier le build + test navigateur de /driver (connexion Alain)
