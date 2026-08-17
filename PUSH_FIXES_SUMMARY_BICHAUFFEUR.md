# ✅ Corrections bi-chauffeur appliquées (2026-08-17)

## Implémentations complétées

### 1️⃣ Headers HTTP manquants ✅
**Fichier** : [public/_headers](public/_headers)  
**Changements** :
- ✅ Ajouté `Service-Worker-Allowed: /`
- ✅ Ajouté `Content-Type: application/javascript; charset=utf-8`
- ✅ Ajouté `X-Content-Type-Options: nosniff`
- ✅ Ajouté `Access-Control-Allow-Origin: *`

**Impact** : iOS peut maintenant enregistrer le Service Worker FCM

---

### 2️⃣ Message listener SKIP_WAITING ✅
**Fichier** : [public/firebase-messaging-sw.js](public/firebase-messaging-sw.js)  
**Changements** :
- ✅ Ajouté `self.addEventListener("message", ...)` pour écouter les messages du client
- ✅ Gère `FCM_SW_SKIP_WAITING` et `SKIP_WAITING`
- ✅ Force `self.skipWaiting()` pour activation immédiate

**Impact** : Les nouvelles versions du SW s'activent sans attendre

---

### 3️⃣ Initialisation Firebase précoce ✅
**Fichier** : [src/components/FirebaseInitializer.tsx](src/components/FirebaseInitializer.tsx) (NOUVEAU)  
**Changements** :
- ✅ Nouveau composant React
- ✅ Appelle `initFirebase()` au montage
- ✅ Non-bloquant et silencieux si échoue

**Fichier** : [src/routes/__root.tsx](src/routes/__root.tsx)  
**Changements** :
- ✅ Importé `FirebaseInitializer`
- ✅ Ajouté dans le JSX avant `PwaController`

**Impact** :
- Chauffeur qui ouvre `/driver` directement → Firebase est déjà init
- Client qui ouvre `/` → Firebase chargé en parallèle
- Token FCM disponible plus rapidement

---

### 4️⃣ Déduplication bi-chauffeur ✅
**Fichier** : [public/firebase-messaging-sw.js](public/firebase-messaging-sw.js)  
**Changements** :
```javascript
// AVANT :
dedupeKey(data, notif) {
  return [data.tag || notif.tag || "taxi-fcm", data.reservation_id || "", notif.title || data.title || ""].join("|");
}

// APRÈS :
dedupeKey(data, notif) {
  return [
    data.audience || "unknown",  // ← AJOUTÉ
    data.tag || notif.tag || "taxi-fcm",
    data.reservation_id || "",
    notif.title || data.title || ""
  ].join("|");
}
```

**Impact** : Une notif chauffeur et client pour la même course ne se suppriment plus mutuellement

---

### 5️⃣ Payload FCM amélioré + Filter audience ✅
**Fichier** : [src/lib/push.server.ts](src/lib/push.server.ts)  
**Changements** :
```typescript
// AVANT :
const extraData = {
  url: relativeUrl,
  click_url: clickUrl,
  tag: payload.tag || "taxi-fcm",
  audience,
  ...(reservationId ? { reservation_id: reservationId } : {}),
};

// APRÈS :
const extraData = {
  url: relativeUrl,
  click_url: clickUrl,
  tag: payload.tag || "taxi-fcm",
  audience,
  audience_marker: `${audience}:${Date.now()}`,  // ← AJOUTÉ (debug/traçabilité)
  ...(reservationId ? { reservation_id: reservationId } : {}),
};
```

**Fichier** : [public/firebase-messaging-sw.js](public/firebase-messaging-sw.js)  
**Changements** :
```javascript
// AVANT : directement affichage de la notif
// APRÈS : validation audience
if (data.audience) {
  const isDriverPath = self.location.pathname.includes("/driver");
  const expectedAudience = isDriverPath ? "chauffeur" : "client";
  if (data.audience !== expectedAudience) {
    console.log(`[FCM SW] Notif audience mismatch (...), ignoring`);
    return; // ← Rejette silencieusement si destinée à l'autre app
  }
}
```

**Impact** : 
- Notif chauffeur ne s'affichera jamais à un client (même si elle arrive par erreur)
- Notif client ne s'affichera jamais à un chauffeur
- Logs de debug pour tracer les problèmes

---

## 📊 Résumé des corrections

| Problème | Avant | Après | Sévérité |
|----------|--------|--------|----------|
| Headers HTTP | ❌ Manquants | ✅ Complets | CRITIQUE |
| SKIP_WAITING | ❌ Pas écouté | ✅ Implémenté | HIGH |
| Firebase init | ❌ À la demande | ✅ Précoce | HIGH |
| Dédup audience | ❌ Non présente | ✅ Incluse | MEDIUM |
| Filter audience | ❌ Pas de filtrage | ✅ Validé | MEDIUM |

---

## 🚀 Déploiement

1. **Commit et push** :
   ```bash
   git add .
   git commit -m "fix: complete bi-chauffeur push notifications stack"
   git push
   ```

2. **Attendre le déploiement** (~1-2 minutes sur Lovable)

3. **Tester** :
   - Ouvrir l'app client → Fermer → Envoyer notif test → Devrait arriver
   - Ouvrir `/driver` → Fermer → Envoyer notif test chauffeur → Devrait arriver
   - Chauffeur ne doit jamais recevoir notif client (et vice-versa)

---

## 🎯 Prochaines étapes (optionnel)

Si ça marche toujours pas, activer le diagnostic complet :

```bash
# Ajouter temporairement dans src/routes/reserver.tsx ou src/routes/driver.tsx :
import { PushDebug } from "@/components/PushDebug";

// Dans le JSX :
{process.env.NODE_ENV === "development" && <PushDebug />}
```

Puis exécuter le guide : [PUSH_NOTIFICATIONS_TROUBLESHOOTING.md](PUSH_NOTIFICATIONS_TROUBLESHOOTING.md)

---

**Status** : ✅ Toutes les corrections de haut niveau sont en place. La majorité des problèmes bi-chauffeur devrait être résolue.
