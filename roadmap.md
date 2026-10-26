# Feuille de route — Espace chauffeur

## Terminé
- [x] Port complet de l'espace chauffeur Nova Taxi Prestige (7 onglets, même ordre) sur la base externe
- [x] Base externe : tables chauffeur + colonnes reservations + verify_driver_password + buckets receipts/backups
- [x] Comptes Alain / Patricia / admin créés (codes existants comme mots de passe initiaux)
- [x] Espace chauffeur unique sans mot de passe ni choix de prénom : ouverture automatique sur le compte partagé « equipe » (driverAutoEnter), écran de connexion, dialogue « Bonjour Alain ? » et sélecteur de prénom supprimés
- [x] Texte plus gros sur mobile dans tout l'espace chauffeur (bloc CSS final dans driver-shell-css.ts)
- [x] Formulaire de résa : numéros de rue conservés (viewbox Nominatim Charente-Maritime + le texte tapé est gardé si la suggestion ne contient pas le numéro)
- [x] Types régénérés : tables chauffeur + colonnes reservations réintégrées dans src/integrations/supabase/types.ts (fusion depuis /tmp/types-external.ts)
- [x] Build OK + tests navigateur : ouverture directe /driver sur mobile et desktop, 7 onglets, formulaire avec « 12 rue de Verdun Marennes »
