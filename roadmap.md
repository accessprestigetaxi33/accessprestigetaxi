# Feuille de route — Espace chauffeur

## Terminé
- [x] Port complet de l'espace chauffeur Nova Taxi Prestige (7 onglets, même ordre) sur la base externe
- [x] Base externe : tables chauffeur + colonnes reservations + verify_driver_password + buckets receipts/backups
- [x] Comptes Alain / Patricia / admin créés (codes existants comme mots de passe initiaux)
- [x] Build OK + test navigateur /driver

## En cours (demande du 26/10)
- [ ] Espace chauffeur unique sans mot de passe ni choix de prénom : ouverture automatique sur le compte partagé « equipe » (driverAutoEnter), suppression de l'écran de connexion, du dialogue « Bonjour Alain ? » et du sélecteur de prénom
- [ ] Texte plus gros sur mobile dans tout l'espace chauffeur (bloc CSS final dans driver-shell-css.ts)
- [ ] Formulaire de résa : corriger la perte des numéros de rue (viewbox Nominatim biaisée Bordeaux → Charente-Maritime + conserver le numéro tapé si la suggestion ne le contient pas)
- [ ] Vérifier build + test navigateur (ouverture directe /driver sur mobile, création résa avec numéro de rue)
