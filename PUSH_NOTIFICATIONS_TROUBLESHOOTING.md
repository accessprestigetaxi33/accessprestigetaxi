# 🔔 Guide Diagnostique Push Notifications

## Problème signalé
Les notifications ne s'affichent **PAS** quand l'écran est fermé sur **iPad, iPhone, Android**.

---

## ✅ Corrections appliquées (2026-08-17)

### 1. **Déduplication trop agressive**
- **Avant** : 15s
- **Après** : 30s
- **Raison** : Évite de supprimer les vraies notifs sur réseau instable

### 2. **`requireInteraction` désactivé sur iOS**
- **Avant** : toujours `true`
- **Après** : `false` sur iOS, configurable sur Android
- **Raison** : iOS rejette certaines notifs avec ce flag activé

### 3. **SW Firebase ne s'activait pas à temps**
- **Avant** : timeout 8s
- **Après** : timeout 15s
- **Raison** : 4G/3G peuvent être plus lents

### 4. **`onBackgroundMessage` ne montrait JAMAIS les notifs**
- **Avant** : retournait sans afficher si `payload.notification` existait
- **Après** : affiche toujours via `showNotification()`
- **Raison** : iOS gère auto, mais Android/Web non

---

## 🧪 TEST 1: Vérifier l'installation du Service Worker

Ouvre la console sur **ton appareil mobile** (via DevTools distant ou Safari):

```javascript
// Vérifier les SWs enregistrés
navigator.serviceWorker.getRegistrations().then(regs => {
  console.table(regs.map(r => ({
    scriptURL: r.active?.scriptURL || "?",
    state: r.active?.state || "?",
    isFCM: r.active?.scriptURL.includes("firebase-messaging-sw")
  })))
})
```

**Résultat attendu** : Tu dois voir au moins 2 SWs :
- ✅ `/firebase-messaging-sw.js` (active) — gère les push
- ✅ `/sw.js` (active) — cache hors-ligne

---

## 🧪 TEST 2: Permissions de notification

```javascript
console.log("Permission actuelle:", Notification.permission)
// Attendu : "granted"

// Si "denied", il faut réinitialiser les permissions du navigateur:
// iPhone: Settings → Privacy → Notifications → revenir à l'app
// Android: Settings → Apps → [ton app] → Permissions → Notifications
// iPad: Settings → Notifications → [ton app] → Allow Notifications
```

---

## 🧪 TEST 3: Token FCM

```javascript
// Via l'app
import { getFcmToken } from "@/lib/firebase";
const token = await getFcmToken({ forceRefresh: true });
console.log("Token FCM:", token ? token.slice(-20) : "NULL");
```

**Si NULL** :
- Permission refusée (voir Test 2)
- Service Worker FCM non trouvé (voir Test 1)
- Navigateur sans support (Edge/FireFox sur mobile)

---

## 🧪 TEST 4: Outil de diagnostic dans l'app

**Ajoute temporairement** dans tes routes principales (`src/routes/__root.tsx` ou une page client):

```tsx
import { PushDebug } from "@/components/PushDebug";

// Dans le JSX:
{process.env.NODE_ENV === "development" && <PushDebug />}
```

Puis ouvre l'app → clique sur "Lancer diagnostic" → prends une capture d'écran des résultats.

---

## 🧪 TEST 5: Test de notification serveur

Si tout est OK au test 4 ✅, envoie une **vraie notification** depuis ton backend Firebase:

**Depuis Firebase Console** :
1. Va dans **Cloud Messaging**
2. Clique **"Send your first message"**
3. Titre : `Test`
4. Corps : `Cela fonctionne!`
5. Utilisateur cible : copie-colle le token FCM de Test 3
6. Envoie
7. **Ferme complètement l'app** et attends 5 secondes

**Résultat attendu** :
- 🟢 **Avec l'app ouverte** : notification reçue + app refresh
- 🟢 **App fermée** : notification système apparaît sur l'écran

---

## 🚨 Si ça ne marche TOUJOURS pas

### Cas A: Test 1 ✅ mais Test 3 ✗ (token NULL)

```
→ Permission refusée
Demande la permission explicitement :
```

```tsx
import { usePushNotifications } from "@/hooks/usePushNotifications";

const YourComponent = () => {
  const { subscribe, status } = usePushNotifications();
  
  return (
    <button onClick={() => subscribe("client")}>
      {status === "granted" 
        ? "Notifications activées ✅" 
        : status === "denied"
        ? "Notifications bloquées 🚫"
        : "Activer notifications"}
    </button>
  );
};
```

### Cas B: Test 1 ✗ (FCM SW absent)

```
→ Impossible d'enregistrer le service worker
Vérifications :
1. Vérifier /firebase-messaging-sw.js existe ✅
2. Vérifier qu'il est servi sans authentification ✅
3. Vérifier les en-têtes HTTP (Content-Type: application/javascript) ✅
4. Vérifier /api/public/firebase-config accessible ✅
```

### Cas C: Test 5 ✗ (notif serveur ne vient pas)

```
→ Configuration backend ou Firebase incorrecte
Vérifications :
1. Backend envoie le bon token FCM ✅
2. Serveur a la clé privée Google Cloud Messaging ✅
3. Le projet Firebase est bien connecté au réseau ✅
4. Pas de filtrage de domaine sur les notifs ✅
```

---

## 📋 Checklist avant production

- [ ] Test 1 ✅ (SWs enregistrés)
- [ ] Test 2 ✅ (permission = "granted")
- [ ] Test 3 ✅ (token FCM valide)
- [ ] Test 4 ✅ (diagnostic lance sans erreur)
- [ ] Test 5 ✅ (notif système reçue app fermée)
- [ ] Testé sur **au moins 2 appareils réels** (pas émulateur)
- [ ] Testé sur **WiFi et 4G/5G**
- [ ] Testé après **50 jours** (rotation token)

---

## 🔧 Commandes utiles pour développeurs

### Voir les logs du SW en temps réel (Chrome/Android)
```bash
chrome://inspect/#service-workers
# Puis clique "inspect" sur firebase-messaging-sw.js
```

### Envoyer une notification de test depuis le SW
```javascript
// Dans le console du SW inspector:
self.registration.showNotification("Test", {
  body: "Cela devrait s'afficher",
  tag: "test-manual",
  requireInteraction: false
})
```

### Forcer l'activation du SW (s'il est en attente)
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(r => {
    if (r.waiting) r.waiting.postMessage({ type: "FCM_SW_SKIP_WAITING" })
  })
})
```

---

## 📞 Support Firebase

Si tu as toujours un problème après ces tests, fournis:
1. Résultat du Test 4 (capture PushDebug)
2. Résultat du Test 5 (a-t-il essayé d'envoyer?)
3. Appareil exact et OS (ex: iPhone 15 iOS 18, Samsung S24 Android 14)
4. Logs du backend (tokens stockés, notifications envoyées)
