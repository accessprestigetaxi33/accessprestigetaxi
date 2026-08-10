import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nProvider";
import { registerPWA } from "@/lib/pwa";
import { startReviewQueueSync } from "@/lib/review-queue";

export function PwaController() {
  const { lang } = useI18n();

  useEffect(() => {
    return registerPWA((applyUpdate) => {
      const en = lang === "en";
      toast(en ? "A new version is ready" : "Une nouvelle version est prête", {
        description: en
          ? "Refresh when convenient to use the latest version."
          : "Actualisez quand vous le souhaitez pour utiliser la dernière version.",
        duration: Infinity,
        icon: <RefreshCw className="h-4 w-4" />,
        action: {
          label: en ? "Refresh" : "Actualiser",
          onClick: applyUpdate,
        },
      });
    });
  }, [lang]);

  useEffect(() => {
    return startReviewQueueSync(() => {
      toast.success(
        lang === "en"
          ? "Your offline review has just been sent."
          : "Votre avis enregistré hors ligne vient d'être envoyé.",
      );
    });
  }, [lang]);

  return null;
}