import { useEffect } from "react";
import type { OgLang } from "@/lib/og";

export type SocialMeta = {
  title: string;
  description: string;
  image: string;
  alt: string;
  url: string;
};

function setTag(attr: "property" | "name", key: string, value: string) {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

/**
 * Garde les balises og:* / twitter:* alignées avec la langue courante quand
 * l'utilisateur change de langue SANS recharger la page (le head() du routeur
 * n'est évalué qu'au chargement / changement de search params).
 */
export function SocialMetaSync({
  lang,
  fr,
  en,
}: {
  lang: OgLang;
  fr: SocialMeta;
  en: SocialMeta;
}) {
  useEffect(() => {
    const m = lang === "en" ? en : fr;
    document.title = m.title;
    setTag("name", "description", m.description);
    setTag("property", "og:title", m.title);
    setTag("property", "og:description", m.description);
    setTag("property", "og:image", m.image);
    setTag("property", "og:image:secure_url", m.image);
    setTag("property", "og:image:alt", m.alt);
    setTag("property", "og:url", m.url);
    setTag("property", "og:locale", lang === "en" ? "en_GB" : "fr_FR");
    setTag("property", "og:locale:alternate", lang === "en" ? "fr_FR" : "en_GB");
    setTag("name", "twitter:card", "summary_large_image");
    setTag("name", "twitter:title", m.title);
    setTag("name", "twitter:description", m.description);
    setTag("name", "twitter:image", m.image);
    setTag("name", "twitter:image:alt", m.alt);
  }, [lang, fr, en]);

  return null;
}
