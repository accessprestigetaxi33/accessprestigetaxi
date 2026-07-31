// Helper pour générer les balises hreflang.
// Toutes les pages sont servies à la même URL avec i18n client — on déclare
// donc les 2 langues (fr/en) sur la même URL + x-default (français).
const LANGS = ["fr", "en"] as const;

export function hreflangLinks(url: string) {
  return [
    ...LANGS.map((l) => ({ rel: "alternate" as const, hrefLang: l, href: url })),
    { rel: "alternate" as const, hrefLang: "x-default", href: url },
  ];
}
