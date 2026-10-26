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
- Authentification chauffeur : tables driver_accounts + driver_sessions de la base EXTERNE (login email + mot de passe via verify_driver_password pgcrypto, session 30 jours). Les anciens codes DRIVER_CODE_* servent de mots de passe initiaux ; le compte "admin" est un accès de secours exclu des profils.
- Les modules chauffeur Nova utilisent @/lib/nova-supabase.server (service role) et @/lib/nova-supabase (navigateur) — jamais les clients Lovable Cloud.
- Les tables chauffeur (driver_accounts, driver_sessions, driver_expenses, accounting_settings, driver_chat, driver_unavailability) et les colonnes reservations driver_slug/overflow_*/prix_final/etc. sont ajoutées manuellement dans src/integrations/supabase/types.ts : une régénération des types depuis Lovable Cloud les effacerait (elles n'existent que dans la base externe).
- Ne pas modifier la config notifications push (usePushNotifications, push.server.ts, firebase.ts) sans demande explicite.
