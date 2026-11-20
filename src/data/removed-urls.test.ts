import { describe, expect, it } from "vitest";
import { REMOVED_URLS } from "./removed-urls";
import { isRemovedPage } from "@/lib/removed-pages";

describe("plan du site des pages retirées", () => {
  it("ne contient aucune page de la zone Marennes-Hiers-Brouage / Ciré-d'Aunis", () => {
    for (const kept of ["/", "/taxi-marennes", "/taxi/hiers-brouage", "/taxi/cire-d-aunis", "/faq", "/blog"]) {
      expect(REMOVED_URLS).not.toContain(kept);
    }
  });
  it("chaque page hors blog est bien déclarée supprimée (410) par le serveur", () => {
    for (const p of REMOVED_URLS.filter((u) => !u.startsWith("/blog/"))) {
      expect(isRemovedPage(p), p).toBe(true);
    }
  });
});
