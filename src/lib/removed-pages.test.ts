import { describe, expect, it } from "vitest";
import { isRemovedPage } from "./removed-pages";

describe("pages retirées de Google", () => {
  it("retire Oléron, Charente-Maritime et les destinations", () => {
    expect(isRemovedPage("/taxi-oleron")).toBe(true);
    expect(isRemovedPage("/taxi-charente-maritime")).toBe(true);
    expect(isRemovedPage("/destinations")).toBe(true);
    expect(isRemovedPage("/destinations/taxi-saintes-royan")).toBe(true);
  });
  it("retire les communes hors zone", () => {
    expect(isRemovedPage("/taxi/rochefort")).toBe(true);
    expect(isRemovedPage("/taxi/bourcefranc-le-chapus")).toBe(true);
  });
  it("garde Marennes, Hiers-Brouage et Ciré-d'Aunis", () => {
    expect(isRemovedPage("/taxi-marennes")).toBe(false);
    expect(isRemovedPage("/taxi/hiers-brouage")).toBe(false);
    expect(isRemovedPage("/taxi/cire-d-aunis")).toBe(false);
    expect(isRemovedPage("/")).toBe(false);
  });
});
