# 🚨 Problèmes Bi-Chauffeur — Notifications Push

## Architecture détectée
- **Site client** : routes `/`, `/reserver`, `/client.*`, `/suivi/*`
- **Espace chauffeur** : route `/driver` (protégée par token)
- **Service Workers** : 
  - `/sw.js` (PWA Vite) — cache applicatif
  - `/firebase-messaging-sw.js` (FCM) — notifications push

---

## ❌ PROBLÈMES CRITIQUES DÉTECTÉS

### 1️⃣ **Headers HTTP manquants (iOS bloquerait)**

**Problème** : L'en-tête `Service-Worker-Allowed` est manquant dans la réponse pour `/firebase-messaging-sw.js`.

**Impact** :
- 🔴 iOS (Safari PWA) : SW ne s'enregistre pas du tout
- 🟠 Android : peut fonctionner mais instable
- 🔴 iPad : même problème que iOS

**Solution** : Ajouter les headers dans `public/_headers` :

```
/firebase-messaging-sw.js
  cache-control: no-cache
  Service-Worker-Allowed: /
  Content-Type: application/javascript; charset=utf-8
  Access-Control-Allow-Origin: *
```

---

### 2️⃣ **Content-Type du Service Worker incorrect**

**Problème** : Le SW FCM est peut-être servi en `text/javascript` au lieu de `application/javascript`.

**Impact** :
- 🔴 Chrome/Edge strict : refuse le SW
- 🔴 iOS 17+ : refuse complètement
- 🟠 Ancien Android : peut passer

**Solution** : Vérifier dans `_headers` que le `Content-Type` est correct.

---

### 3️⃣ **Deux Service Workers en conflit**

**Problème** : `/sw.js` (Vite PWA) et `/firebase-messaging-sw.js` (FCM) s'interfèrent mutuellement.

**Symptôme** :
- Notification arrive au SW Vite (qui la met en cache)
- SW FCM ne la traite jamais
- Utilisateur ne voit rien

**Code problématique actuellement** : Dans [src/lib/pwa.ts](src/lib/pwa.ts), le PWA SW est enregistré SANS exclusion du FCM SW :

```ts
void navigator.serviceWorker.register("/sw.js", { scope: "/" })
```

**Solution appliquée partiellement** : Le code skipp déjà les SWs FCM (voir `isMessagingWorker()`), mais c'est à la **désinstallation** seulement. À la première visite, les deux s'enregistrent.

**Risque** : Si `/sw.js` s'active avant `/firebase-messaging-sw.js`, il devient le "premier" SW et Firebase ne peut pas prendre le relais.

---

### 4️⃣ **Initialisation Firebase différée sur `/driver`**

**Problème** : Si quelqu'un ouvre `/driver` directement (lien SMS/WhatsApp), Firebase n'est **pas** initialisé avant qu'on demande le token.

**Ordre d'exécution actuellement** :

```
1. Utilisateur ouvre /driver
2. Route /driver monte
3. usePushNotifications({ autoAudience: "chauffeur" }) lance
4. Appelle getFcmToken()
5. getFcmToken() appelle initFirebase()
6. initFirebase() fait des requêtes réseau lentes → DELAY 1-2s
7. Entre-temps, autres trucs chargent
```

**Risque** : Timeouts, requêtes perdues, SW pas actif à temps.

---

### 5️⃣ **Scope du Service Worker FCM mal configuré pour bi-chauffeur**

**Code actuel** :

```ts
swReg = await navigator.serviceWorker.register(SW_URL, { scope: "/", updateViaCache: "none" });
```

**Problème** : `scope: "/"` est correct SAUF si votre domaine chauffeur est different (ex: `driver.domain.com` au lieu de `domain.com/driver`).

**Vérifier** : Votre URL chauffeur est-elle :
- ✅ `https://accessprestigetaxi.lovable.app/driver` ? → scope "/" est OK
- ❌ `https://driver.accessprestigetaxi.lovable.app/` ? → scope "/" ne suffit pas

---

### 6️⃣ **Update Service Workers ne forçant pas l'activation**

**Problème** : Dans [firebase.ts](src/lib/firebase.ts), on envoie un message `FCM_SW_SKIP_WAITING`, mais le SW ne l'écoute pas.

**Vérifier dans `/firebase-messaging-sw.js`** :

```javascript
// MANQUE cet event listener !
self.addEventListener("message", (event) => {
  if (event.data?.type === "FCM_SW_SKIP_WAITING") {
    self.skipWaiting();
  }
});
```

---

### 7️⃣ **Pas d'initialisation explicite au démarrage**

**Problème** : `initFirebase()` n'est jamais appelé au chargement de la page racine. Elle est appelée **à la demande** par `getFcmToken()`.

**Risque** : Si l'utilisateur ferme l'app avant d'avoir déclenché le hook push, Firebase n'est jamais init.

---

### 8️⃣ **URLs relatives du SW FCM peuvent être erronnées**

**Problème** : Le SW FCM importe depuis CDN Google (Firebase SDK compat) :

```javascript
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");
```

**Risque sur** :
- 🔴 Réseaux restreints (école, entreprise)
- 🔴 Pas de connexion internet (SW offline)
- 🔴 CDN Google bloquée en Chine

**Vérifier** : Console du navigateur, onglet Network → ces fichiers chargent-ils ?

---

### 9️⃣ **Déduplication basée sur `data.tag` trop simple**

**Problème** : Dans [firebase-messaging-sw.js](public/firebase-messaging-sw.js), la déduplication utilise :

```javascript
dedupeKey(data, notif) {
  return [
    data.tag || notif.tag || "taxi-fcm",
    data.reservation_id || "",
    notif.title || data.title || ""
  ].join("|");
}
```

**Risque bi-chauffeur** :
- Chauffeur 1 et Chauffeur 2 reçoivent une notif pour la même course
- Même `reservation_id` → clé identique → une notif est supprimée
- Chauffeur 2 ne reçoit pas sa notif

---

### 🔟 **Payload FCM ne différencie pas client/chauffeur**

**Problème** : Dans [push.server.ts](src/lib/push.server.ts), le payload FCM envoyé est le **même** pour client et chauffeur.

**Risque** : Une notif chauffeur arrivant au client, ou vice-versa :

```javascript
// Même data pour les deux :
data: extraData  // URL, tag, audience dans les mêmes champs
```

**Chauffeur peut recevoir** :
- Notif "Réservation confirmée" destinée à un client
- Notif "Nouveau message" depuis un autre client
- Impossible à filtrer côté client

---

## ✅ SOLUTIONS

### Solution 1 : Ajouter les headers HTTP manquants

Mettre à jour `public/_headers` :

```
/firebase-messaging-sw.js
  cache-control: no-cache
  Service-Worker-Allowed: /
  Content-Type: application/javascript; charset=utf-8
  X-Content-Type-Options: nosniff
  Access-Control-Allow-Origin: *
```

---

### Solution 2 : Forcer l'activation du SW FCM

Ajouter ce code dans `/firebase-messaging-sw.js` (après les imports) :

```javascript
self.addEventListener("message", (event) => {
  if (event.data?.type === "FCM_SW_SKIP_WAITING" || event.data?.type === "SKIP_WAITING") {
    console.log("[FCM SW] SKIP_WAITING message reçu, activation forcée");
    self.skipWaiting();
  }
});
```

---

### Solution 3 : Initialiser Firebase au chargement de la racine

Créer un composant qui initialise Firebase immédiatement :

```tsx
// src/components/FirebaseInitializer.tsx
import { useEffect } from "react";
import { initFirebase } from "@/lib/firebase";

export function FirebaseInitializer() {
  useEffect(() => {
    // Initialiser Firebase dès le montage de la racine
    initFirebase().catch(err => {
      console.warn("[Firebase] Early init failed (non-fatal)", err);
    });
  }, []);
  
  return null;
}
```

Puis l'ajouter dans `src/routes/__root.tsx` :

```tsx
import { FirebaseInitializer } from "@/components/FirebaseInitializer";

// Dans le JSX du root:
<FirebaseInitializer />
<PwaController />
```

---

### Solution 4 : Fixer la déduplication pour bi-chauffeur

Dans [firebase-messaging-sw.js](public/firebase-messaging-sw.js), inclure l'audience dans la clé :

```javascript
function dedupeKey(data, notif) {
  return [
    data.audience || "unknown",  // ← AJOUTER
    data.tag || notif.tag || "taxi-fcm",
    data.reservation_id || "",
    notif.title || data.title || ""
  ].join("|");
}
```

---

### Solution 5 : Différencier les payloads client/chauffeur

Dans [push.server.ts](src/lib/push.server.ts), ajouter un marqueur dans les données :

```ts
const extraData = {
  url: relativeUrl,
  click_url: clickUrl,
  tag: payload.tag || "taxi-fcm",
  audience,
  audience_marker: `${audience}:${new Date().getTime()}`,  // ← AJOUTER
  ...(reservationId ? { reservation_id: reservationId } : {}),
};
```

Puis dans le SW, filtrer :

```javascript
messaging.onBackgroundMessage((payload) => {
  const data = Object.assign({}, payload.webpush?.data || {}, payload.data || {});
  
  // Vérifier que c'est bien pour ce contexte
  const expectedAudience = window.location.pathname.includes("/driver") ? "chauffeur" : "client";
  if (data.audience && data.audience !== expectedAudience) {
    console.log("[FCM SW] Notif pour mauvaise audience, ignoring");
    return; // Ignore si destinée à l'autre app
  }
  
  // ... rest of code
});
```

---

### Solution 6 : Vérifier les CDN bloqués

Console → Network → filtrer "gstatic" → tous les fichiers chargent-ils ?

Si bloqués, copier Firebase SDK localement :

```ts
// Au lieu de :
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");

// Faire :
importScripts("/firebase-sdk/firebase-app-compat.js");
```

---

## 🧪 CHECKLIST DIAGNOSTIQUE

Pour chaque problème ci-dessus :

- [ ] 1. Headers HTTP : console DevTools → Network → /firebase-messaging-sw.js → Response headers → `Service-Worker-Allowed` présent ?
- [ ] 2. Content-Type : même onglet Network → `Content-Type: application/javascript` ?
- [ ] 3. Deux SWs : console → `navigator.serviceWorker.getRegistrations()` → affiche 2 ou 3 SWs ?
- [ ] 4. Firebase init : console → chercher logs `[FCM] init` ou `[FCM] Token obtenu`
- [ ] 5. Scope correct : console → `navigator.serviceWorker.getRegistrations()` → tous ont `scope: "/"` ?
- [ ] 6. SKIP_WAITING : console du SW inspector → recharger la page → logs `SKIP_WAITING` ?
- [ ] 7. initFirebase appelé : console → rafraîchir la page → apparaît-il log `[FCM] Token` immédiatement ?
- [ ] 8. CDN Google : Network → chercher "firebase" et "gstatic" → tous reçoivent 200 OK ?
- [ ] 9. Dédup audience : envoyer 2 notifs rapidement au même appareil → les deux s'affichent ?
- [ ] 10. Bonne audience : chauffeur reçoit notif chauffeur, client reçoit notif client ?

---

## 📞 Procédure complète de test

1. **Pusher les corrections de code** (si tu implémentes Solutions 1-6)
2. **Attendre le déploiement** (~1-2 min sur Lovable)
3. **Ouvrir DevTools** sur ton iPhone/Android :
   - iPhone : Safari → Inspect → choix de l'app → Console
   - Android : Chrome → Menu → More tools → Remote devices → choix du téléphone
4. **Exécuter chaque commande du CHECKLIST ci-dessus**
5. **Fermer l'app complètement** (pas en arrière-plan)
6. **Attendre 10 secondes**
7. **Envoyer une notif de test** depuis Firebase Console
8. **Résultat attendu** : notification système apparaît à l'écran verrouillé

---

## 🎯 Priorité des fixes

1. **URGENT** : Headers HTTP (Solution 1) — bloque iOS complètement
2. **URGENT** : initFirebase précoce (Solution 3) — bloque chauffeur direct
3. **HIGH** : SKIP_WAITING (Solution 2) — améliore stabilité
4. **MEDIUM** : Dédup audience (Solution 4) — évite dupli chauffeur
5. **MEDIUM** : Différencier payloads (Solution 5) — sécurité
6. **LOW** : CDN local (Solution 6) — seulement si bloqué

---

Laisse-moi savoir si tu veux que j'implémente ces solutions directement ! 👍
