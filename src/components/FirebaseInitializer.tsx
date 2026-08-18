/**
 * FirebaseInitializer — initialise Firebase + SW FCM dès le chargement de la page.
 * Évite les délais lors du premier appel à getFcmToken().
 * À ajouter dans le layout racine ou chaque route principale.
 */
import { useEffect } from "react";
import { initFirebase, setupForegroundNotifications } from "@/lib/firebase";

export function FirebaseInitializer() {
  useEffect(() => {
    const stopForegroundNotifications = setupForegroundNotifications();

    // Initialiser Firebase et charger le SW FCM dès que possible
    // C'est non-bloquant : s'il échoue, les hooks push la réessayeront
    initFirebase()
      .then((msg) => {
        if (msg) {
          console.log("[Firebase] Initialisation précoce réussie");
        } else {
          console.log("[Firebase] Non supporté sur ce navigateur/OS");
        }
      })
      .catch((err) => {
        console.warn("[Firebase] Initialisation précoce échouée (non-fatal)", err);
        // L'app continue, getFcmToken() réessayera plus tard
      });

    return stopForegroundNotifications;
  }, []);

  return null;
}
