# Plan : nouveau système de réservation par assistant IA (Allo Taxi Bordeaux → Access Prestige Taxi)

## Objectif
Remplacer la page `/reserver` actuelle (formulaire classique) par le système conversationnel d'Allo Taxi Bordeaux : un assistant IA qui guide le client en 2-3 questions, calcule un devis en direct, vérifie les créneaux et crée la réservation. Le tout adapté à la config Access Prestige Taxi (FR/EN, Charente-Maritime, bi-chauffeur Patricia/Alain, BMW iX1 + van Mercedes 7 places, sièges bébé/enfant, 5j/7 8h-20h).

## Fichiers créés

1. `src/lib/reserver-chat.functions.ts`
   - Server function `aiChatReservation` appelant Lovable AI Gateway (`google/gemini-2.5-flash`).
   - 3 outils IA : `compute_quote`, `check_slot`, `confirm_reservation`.
   - `computeQuote` : géocodage départ/arrivée via `src/lib/googleGeocode.ts`, itinéraire via `src/lib/googleRoute.ts`, tarif via `src/lib/tarif.ts`.
   - `checkSlot` : vérifie qu'aucune réservation active n'est à moins de 30 min du créneau demandé.
   - `confirmReservation` : insère la réservation via `supabaseAdmin`, génère le `suivi_id`, envoie les notifications/push existantes.
   - Prompt système bilingue FR/EN, identité "Sophie" → "Access Prestige Taxi", ton humain et professionnel.

2. `src/lib/address-resolver.server.ts`
   - Résolution d'adresse côté serveur avec retour structuré `{ok, geocode, reason, hint}`.
   - Sanitizer de réponses IA pour éviter fuites techniques.
   - Lieux canoniques Charente-Maritime : Aéroport La Rochelle-Île de Ré, Gare de La Rochelle, Gare de Royan, Gare de Saintes, Gare de Rochefort, Vieux-Port La Rochelle, Port de Royan, Île de Ré, Île d'Oléron, Zoo de La Palmyre, Aquarium de La Rochelle, etc.

3. `src/lib/stt.functions.ts`
   - Server function `transcribeAudio` : reçoit un blob audio base64, appelle Lovable AI Gateway speech-to-text avec détection automatique de la langue (fr/en).

4. `src/components/AddressAutocomplete.tsx` (si absent)
   - Autocomplétion d'adresses basée sur `searchAddress` existant.

## Fichiers modifiés

1. `src/routes/reserver.tsx`
   - Refonte complète en interface conversationnelle.
   - Chat avec messages utilisateur/assistant, récapitulatif de devis, carte Google Maps interactive (départ/arrivée).
   - Saisie vocale avec détection de silence, transcription en direct, messages d'erreur clairs (micro refusé, non supporté, etc.).
   - Boutons de suggestions rapides.
   - Étapes visuelles : trajet → devis → confirmation.
   - Géolocalisation automatique du départ.
   - Navigation vers `/suivi/$id` après confirmation.
   - SEO/head bilingue avec title/description/og/hreflang.

2. `src/i18n/dict.ts`
   - Ajout des clés `chat.*` en français et anglais : greeting, suggestions, étapes, placeholders, messages vocaux, erreurs, statuts, libellés de la carte.

3. `src/lib/googleGeocode.ts`
   - Mise à jour des lieux canoniques pour la Charente-Maritime.
   - Ajustement du biais de zone géographique (centre La Rochelle / Royan, rayon 80 km).

4. `src/lib/googleRoute.ts`
   - Suppression/adaptation du waypoint rocade bordelaise (non pertinent en Charente-Maritime).
   - Sélection route la plus rapide pour la durée ; distance réelle Google pour le prix.

5. `src/lib/tarif.ts`
   - Aucun changement de logique ; les constantes actuelles (prise en charge 2,70 €, jour 2,28 €/km, nuit 3,22 €/km) sont conservées.

6. `src/routes/__root.tsx`
   - Ajout de `/reserver` dans `hiddenChromePrefixes` pour que la page de réservation soit sans header/footer (expérience immersive comme Allo Taxi Bordeaux).

7. `src/lib/reservation-create.functions.ts`
   - Conservation du schéma existant ; le chat utilisera `createReservationPublic` ou une insertion directe via `supabaseAdmin` selon le besoin d'idempotence.

## Détails techniques

- **Langues** : le site n'expose que FR et EN. L'IA reçoit `lang_code: "fr" | "en"` et répond dans la langue du client. Les prompts système sont générés dynamiquement en FR ou EN.
- **Bi-chauffeur** : la confirmation crée une réservation en `status: "pending"` ; l'assignation round-robin Patricia/Alain reste gérée par les triggers existants. Le chat ne choisit pas de chauffeur.
- **Véhicules** : le prompt mentionne "BMW iX1 100 % électrique (jusqu'à 4 passagers) et van Mercedes (jusqu'à 7 passagers)". L'option "transport de groupe" force passagers ≥ 5 et mentionne le van.
- **Sièges bébé/enfant** : ajout d'un champ `siege_enfant` (aucun / bébé 0-1 an / enfant 1-4 ans / rehausseur 4-10 ans) transmis dans `message` et dans une colonne existante si disponible.
- **Horaires** : le prompt rappelle "5j/7, 8h-20h". `checkSlot` refuse les créneaux en dehors de ces horaires avec message explicite.
- **Tarification** : devis instantané basé sur distance Google Maps + tarif mixte jour/nuit selon l'heure de Paris.
- **Paiement** : non demandé dans le chat ; le chauffeur gère le règlement en véhicule (CB, espèces). Le chat ne demande donc pas de moyen de paiement.
- **Notifications** : réutilisation de `notifyReservationCreated` / push existants après insertion.
- **Sécurité** : `aiChatReservation` est une server function publique (pas besoin d'auth). Aucune clé API n'est exposée côté client. Le prix final est recalculé côté serveur avant insertion (pas de confiance dans la valeur renvoyée par l'IA).

## Validation

1. `bunx tsgo --noEmit` sans erreur.
2. `bun run build` passe.
3. Test manuel preview : ouvrir `/reserver`, envoyer un message texte, vérifier le devis, confirmer, recevoir l'email/push, arriver sur `/suivi/$id`.
4. Test vocal : autoriser le micro, dicter un trajet, vérifier la transcription et l'envoi auto.
5. Test anglais : basculer la langue, vérifier greeting et réponses IA en anglais.
