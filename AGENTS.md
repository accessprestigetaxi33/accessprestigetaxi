<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Espace chauffeur (/driver)
- La page /driver est portée du projet Nova Taxi Prestige : onglets TABLEAU DE BORD, COURSES, TERMINÉES, DÉBORDEMENT, PLANNING, MESSAGES, COMPTABILITÉ, dans cet ordre. Ses modules vivent dans src/lib/driver.functions.ts, driver-ops/driver-extra/driver-accounting.functions.ts, driver-session.server.ts, ops.server.ts, driverProfile.ts, driver-shell-css.ts et src/components/driver/*.
- Authentification chauffeur : espace commun SANS mot de passe ni choix de prénom — driverAutoEnter (driver.functions.ts) ouvre automatiquement une session sur le compte partagé « equipe » (tables driver_accounts + driver_sessions de la base EXTERNE, sessions sans expiration) ; le profil « equipe » est forcé sur chaque appareil. driverPasswordLogin (email + mot de passe via verify_driver_password pgcrypto) reste disponible en secours ; les comptes alain/patricia/admin restent en base, ne pas les supprimer.
- Les modules chauffeur Nova utilisent @/lib/nova-supabase.server (service role) et @/lib/nova-supabase (navigateur) — jamais les clients Lovable Cloud.
- Types de la base EXTERNE : src/integrations/supabase/types-external.ts (généré depuis la base externe, exporte Database). nova-supabase.ts, nova-supabase.server.ts l'importent — JAMAIS types.ts, qui est régénéré depuis Lovable Cloud et écrase toute addition manuelle.
- Ne pas modifier la config notifications push (usePushNotifications, push.server.ts, firebase.ts) sans demande explicite.
