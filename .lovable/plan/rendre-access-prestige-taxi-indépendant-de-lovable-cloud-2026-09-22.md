# Rendre Access Prestige Taxi indépendant de Lovable Cloud

## Résultat de l'audit (état actuel)

**Ce qui fonctionne déjà sans Lovable** (base de données) : 15 tables utilisées activement — réservations, messages course, messagerie directe, comptes clients, adresses favorites, trajets récurrents, devis, avis, position GPS chauffeurs, abonnements notifications, journaux (suivi, e-mails, visiteurs), historique des événements de course. Plus 8 fonctions base de données (suivi de course, historique des prix, compteur de visiteurs, file d'e-mails, trajets récurrents…) et une dizaine de déclencheurs automatiques (attribution du chauffeur en rotation, journal des changements de statut, alerte nouvelle réservation).

**Ce qui tomberait en panne à 0 crédit Lovable** (5 dépendances) :

| Fonctionnalité | Dépendance actuelle | Remplacement proposé |
|---|---|---|
| Assistant de réservation par chat | Passerelle IA Lovable | Clé OpenAI directe (à fournir) |
| Dictée vocale de la réservation | Passerelle IA Lovable | Même clé OpenAI (transcription) |
| Recherche d'adresses + calcul trajet/prix | Passerelle Google Maps Lovable | Clé Google Maps propre (à fournir) |
| E-mails (confirmations, factures, devis, annulations) | Service e-mail Lovable, Resend en secours | Resend en principal (clé déjà là) |
| Journal des rebonds e-mail | Webhooks Lovable | Webhook Resend |

Le reste — pages, réservation, suivi, espace client, espace chauffeur, notifications push (Firebase), tâches automatiques, sécurité des accès — ne dépend pas de Lovable.

## Point à trancher : l'hébergement

Votre message dit d'abord « on garde juste le site sur Lovable, pas de Vercel », puis « hébergement : Vercel ». Ces deux options ne se combinent pas. Mon avis : **rester sur l'hébergement actuel avec votre domaine** est plus sûr (aucune URL ni référencement touché) et il est déjà indépendant de vos crédits. Dites-moi si vous préférez Vercel malgré tout — cela demande un travail séparé (dépôt GitHub, redéploiement, nouveaux DNS).

## Plan de migration

### Lot 1 — Nouvelle base de données (aucune donnée touchée)
1. Recréer à l'identique dans votre nouveau projet Supabase : les 37 tables, les types, toutes les règles de sécurité et permissions, les 22 fonctions, les 13 déclencheurs, les index.
2. Copier les données existantes (lecture seule sur l'ancienne base, rien n'est supprimé ni modifié).
3. Vérifier les compteurs ligne par ligne entre les deux bases.

### Lot 2 — Remplacement des services Lovable
4. E-mails : Resend devient l'envoi principal, avec votre clé déjà enregistrée, exclusivement côté serveur. Webhook Resend pour les rebonds.
5. Chat et dictée vocale : bascule sur votre propre clé IA.
6. Adresses et calcul de prix : bascule sur votre propre clé Google Maps.
7. Notifications push : inchangées (Firebase, déjà indépendant).
8. Tâches automatiques (rappels J-1, trajets récurrents, nettoyage, recalcul des durées) : planifiées dans votre nouveau projet Supabase, protégées par un secret privé.

### Lot 3 — Bascule
9. Le site pointe vers la nouvelle base ; l'ancienne reste intacte et consultable.
10. Fenêtre de bascule courte, avec possibilité de revenir en arrière en changeant une seule valeur.

### Lot 4 — Tests avant mise en production
Accueil, navigation, réservation de bout en bout, suivi de course, espace client (connexion, factures, messagerie), espace chauffeur, e-mails réels, notifications, sécurité des accès, mobile/tablette/ordinateur, erreurs réseau. Puis **test d'indépendance** : les services Lovable sont neutralisés et je vérifie que réservation, suivi, e-mails et espaces client/chauffeur fonctionnent toujours.

## Ce qu'il me faut de votre côté

1. **Clé IA** (OpenAI ou équivalent) pour le chat et la dictée — sinon ces deux fonctions s'arrêteront à 0 crédit.
2. **Clé Google Maps** à vous (facturation Google activée) pour les adresses et le calcul des prix.
3. Le mot de passe de base de données que vous avez collé dans le chat : je le range dans le coffre à secrets. **Changez-le ensuite**, un mot de passe passé en clair dans une conversation doit être considéré comme exposé.

## Détails techniques

- Schéma extrait par `pg_dump --schema-only` de l'ancien projet, rejoué sur le nouveau, puis données via `pg_dump --data-only --no-owner` table par table dans l'ordre des clés étrangères.
- Nouvelles valeurs serveur : `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL` du projet `ndclargxvgpgifkmsruv`, plus `OPENAI_API_KEY` et `GOOGLE_MAPS_API_KEY` propres. `RESEND_API_KEY` déjà présent.
- `src/lib/email-templates/send-email.ts` : Resend passe en chemin principal (l'appel Lovable devient le secours facultatif).
- `src/lib/ai-gateway.server.ts`, `src/routes/api/chat.ts`, `src/lib/stt.functions.ts`, `src/routes/api/transcribe-stream.ts` : fournisseur IA paramétrable par variable d'environnement.
- `src/lib/google.server.ts` et `src/routes/api/public/places.ts` : appel direct aux API Google (Places, Geocoding, Routes) au lieu de la passerelle.
- Tâches automatiques : `pg_cron` + `pg_net` dans le nouveau projet appelant les routes `/api/public/hooks/*` avec l'en-tête `x-cron-secret`.
- Les routes `/lovable/email/*` restent en place (outil de développement), sans rôle en production.
