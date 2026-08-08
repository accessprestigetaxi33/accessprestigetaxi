import { useEffect, useRef } from "react";

/**
 * Piège le focus clavier à l'intérieur d'une boîte de dialogue modale.
 *
 * - place le focus sur le premier élément focusable à l'ouverture
 * - boucle Tab / Shift+Tab dans la modale (jamais derrière l'overlay)
 * - ferme sur Échap
 * - restaure le focus sur l'élément déclencheur à la fermeture
 */
const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useFocusTrap<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = (document.activeElement as HTMLElement | null) ?? null;

    const focusables = () =>
      Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    const id = window.setTimeout(() => {
      const list = focusables();
      (list[0] ?? ref.current)?.focus();
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !ref.current?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus?.();
    };
  }, [open]);

  return ref;
}
