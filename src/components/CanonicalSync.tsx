import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";
import { SITE_URL, LANG_PARAM, absoluteUrl } from "@/lib/seo-hreflang";

function setLink(rel: string, href: string, hrefLang?: string) {
  const selector = hrefLang
    ? `link[rel="${rel}"][hreflang="${hrefLang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hrefLang) el.setAttribute("hreflang", hrefLang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Garde le canonical et les hreflang cohérents lors d'une navigation interne ou
 * d'un changement de langue sans rechargement (le head() du routeur n'est
 * réévalué qu'au chargement ou au changement de search params).
 *
 * Règles appliquées, identiques au rendu serveur :
 *  - canonical auto-référent : URL nue en FR, URL + ?lang=en en EN ;
 *  - paramètres de tracking (utm_*, fbclid, gclid…) exclus du canonical ;
 *  - pages privées (noindex) laissées telles quelles, sans canonical.
 */
export function CanonicalSync() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { lang } = useI18n();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (robots?.content.includes("noindex")) {
      // Page privée : pas de canonical ni d'alternates à déclarer.
      document.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]').forEach((el) => el.remove());
      return;
    }

    const url = absoluteUrl(pathname);
    const en = `${url}?${LANG_PARAM}=en`;
    setLink("canonical", lang === "en" ? en : url);
    setLink("alternate", url, "fr");
    setLink("alternate", en, "en");
    setLink("alternate", url, "x-default");

    // Doublons éventuels (une seule balise canonical est valide).
    const canonicals = document.head.querySelectorAll('link[rel="canonical"]');
    canonicals.forEach((el, i) => {
      if (i > 0) el.remove();
    });

    const ogUrl = document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrl && ogUrl.content.startsWith(SITE_URL)) {
      ogUrl.setAttribute("content", lang === "en" ? en : url);
    }
  }, [pathname, lang]);

  return null;
}
