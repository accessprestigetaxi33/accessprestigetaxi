/**
 * Mots-clés SEO partagés : les trois requêtes cibles du site
 * (« taxi Marennes », « taxi Brouage », « taxi Ciré-d'Aunis »)
 * plus des variantes propres à chaque page.
 */
export const CORE_KEYWORDS = [
  "taxi Marennes",
  "taxi Marennes-Hiers-Brouage",
  "taxi Brouage",
  "taxi Ciré-d'Aunis",
  "chauffeur privé Marennes",
] as const;

/** Renvoie une balise <meta name="keywords"> combinant les mots-clés cœur et ceux de la page. */
export function keywordsMeta(extra: readonly string[] = []) {
  const all = [...CORE_KEYWORDS, ...extra];
  const seen = new Set<string>();
  const list = all.filter((k) => {
    const key = k.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { name: "keywords", content: list.join(", ") };
}
