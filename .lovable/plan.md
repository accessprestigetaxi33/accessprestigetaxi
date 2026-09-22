# Audit des dépendances Lovable — Access Prestige Taxi

Rien n'est supprimé pour l'instant. Voici l'état réel, puis ce que je propose de faire.

## 1. Ce qui ne dépend déjà plus de Lovable (vérifié en conditions réelles)

| Fonction | Service réellement utilisé |
|---|---|
| Base de données, comptes clients, courses, messages, avis | Votre Supabase |
| Espace client / espace chauffeur (sessions, codes chauffeur) | Votre Supabase |
| Réservation, suivi, devis, facture | Votre Supabase |
| Adresses, distances, durées, prix, cartes | OpenStreetMap + OSRM (sans clé) |
| E-mails de réservation (client + chauffeur) | Resend, domaine accessprestigetaxi.fr |
| Notifications push | Firebase (votre compte) |
| Rappels de course, trajets récurrents, nettoyage, recalcul | Planificateur de votre Supabase |
| Hébergement, construction du site, édition | Lovable (conservé volontairement) |

Test déjà réalisé sans aucune clé Lovable : pages, réservation enregistrée, prix calculé, e-mails partis, tâches automatiques exécutées.

## 2. Dépendances Lovable qui restent — et qui cassent 3 e-mails

C'est le point important que l'audit fait apparaître.

**a) File d'attente d'e-mails vidée par Lovable.** Trois envois ne passent pas par Resend : ils sont déposés dans une file interne à la base que seul le service Lovable venait vider. Aujourd'hui personne ne la vide, donc ces e-mails restent bloqués en « en attente » :
- message du formulaire de contact,
- e-mail de réinitialisation de mot de passe client,
- alerte « nouvelle réservation » déclenchée automatiquement par la base.

**b) Adresses d'expédition périmées** dans ces mêmes envois : `notify.accessprestigetaxi.lovable.app` au lieu de votre domaine vérifié.

**c) Adresse de destination erronée** dans l'alerte automatique de la base : `contact@accesprestigetaxi.fr` (domaine mal orthographié, un « s » manquant).

**d) Passerelle e-mail Lovable** encore appelée par deux anciennes routes de notification (`notify-reservation`, `notify-reservation-client`) qui ne sont plus utilisées par le site.

**e) Assistant de réservation et dictée vocale** : seules fonctions encore branchées sur Lovable. Vous avez dit ne pas les utiliser.

## 3. Clés et secrets — verdict pour chacun

| Secret | Utilisé par | Nécessaire hébergement | Nécessaire métier | Verdict |
|---|---|---|---|---|
| `LOVABLE_API_KEY` | assistant de chat, dictée vocale, secours e-mail, aperçu de modèles | oui (outil Lovable) | non | à conserver, ne plus servir en production |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_DB_URL` | ancienne base Lovable ; encore lus en secours par le code | non | non | à conserver pour le rollback, retirer le secours plus tard |
| `NOVA_SUPABASE_*` | votre base actuelle | – | oui | indispensable |
| `RESEND_API_KEY` | tous les e-mails | – | oui | indispensable |
| `FIREBASE_SERVICE_ACCOUNT_JSON`, `FIREBASE_WEB_API_KEY` | notifications | – | oui | indispensable |
| `CRON_SECRET` | tâches automatiques | – | oui | indispensable |
| `DRIVER_CODE_ALAIN`, `DRIVER_CODE_PATRICIA`, `DRIVER_PANEL_TOKEN` | accès chauffeur | – | oui | indispensable |
| `GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_BROWSER_KEY`, `GOOGLE_API_KEY`, `GOOGLE_SEARCH_CONSOLE_API_KEY` | plus rien depuis le passage à OpenStreetMap | non | non | supprimables, mais sans effet |
| `WEBHOOK_SIGNING_SECRET` | signature de webhooks | non | non | supprimable plus tard |

## 4. Point à trancher : Google Maps ou OpenStreetMap

Votre demande mentionne Google Maps avec votre propre clé serveur. Or, à votre demande précédente, les adresses, distances et prix ont été basculés sur OpenStreetMap/OSRM, sans aucune clé et sans facture — et c'est testé et en ligne. Je recommande de rester sur OpenStreetMap ; revenir à Google demanderait une clé de facturation Google et n'apporterait rien aux tarifs, qui sont calculés par nos règles.

## 5. Ce que je propose de faire maintenant

1. Faire partir les trois e-mails bloqués directement par Resend, sans file d'attente : formulaire de contact, réinitialisation de mot de passe, alerte nouvelle réservation.
2. Corriger les adresses d'expédition vers votre domaine vérifié, et l'adresse de réception de l'alerte.
3. Supprimer les deux anciennes routes de notification qui appelaient la passerelle Lovable (elles ne sont plus utilisées).
4. Neutraliser l'appel à Lovable pour l'assistant et la dictée (fonctions inactives, aucune perte).
5. Nettoyer les adresses d'affichage `accessprestigetaxi.lovable.app` restantes (liens de partage, facture, guide d'installation) au profit de `accessprestigetaxi.fr`.
6. Ne rien supprimer côté données : ancienne base, secrets Lovable et clés Google conservés pour un retour arrière immédiat.
7. Tester ensuite, services Lovable coupés : accueil, navigation, réservation, itinéraire, prix, adresses, espace client, espace chauffeur, suivi, notifications, e-mails (contact, mot de passe, réservation, facture), mobile et ordinateur. Puis publier et vous remettre le rapport final.

## 6. Retour arrière

Aucune donnée ni table supprimée, aucune règle de sécurité modifiée. L'ancienne base reste intacte et une seule valeur à changer suffit pour y revenir. Les envois d'e-mails pourront repasser par l'ancien chemin en réactivant la clé Lovable.

## Détails techniques

- File pgmq `transactional_emails` alimentée par `public.enqueue_email` (appelé par `src/routes/api/public/contact.ts`, `src/lib/client-auth-reset.functions.ts`, trigger `trg_notify_new_reservation`) — aucun consommateur depuis la sortie de Lovable. Remplacement : appel direct `sendTemplateEmail`/Resend côté serveur ; le trigger SQL devient un simple journal, l'alerte admin restant émise par `bookRide`.
- Adresses `noreply@notify.accessprestigetaxi.lovable.app` → `noreply@accessprestigetaxi.fr` ; destinataire `contact@accesprestigetaxi.fr` → `accessprestigetaxi@gmail.com`.
- Suppression de `src/routes/api/public/notify-reservation.ts` et `notify-reservation-client.ts` (EMAIL_BRIDGE_URL Lovable, non référencées hors routeTree).
- `src/lib/ai-gateway.server.ts`, `src/lib/reserver-chat.functions.ts`, `src/routes/api/chat.ts` : erreur explicite « service non configuré » au lieu d'un appel Lovable.
- `src/routes/lovable/email/*` conservées (outil de développement, déjà inertes sans clé).
- Paquets `@lovable.dev/*` conservés : requis par la construction du site sur Lovable.
