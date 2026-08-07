import { HeartPulse, Route as RouteIcon, Award } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const COPY = {
  fr: [
    { icon: HeartPulse, label: "Transport sanitaire conventionné" },
    { icon: RouteIcon, label: "Aucune limite de distance — toutes prestations" },
    { icon: Award, label: "10 ans d'expérience" },
  ],
  en: [
    { icon: HeartPulse, label: "Approved medical transport (conventionné)" },
    { icon: RouteIcon, label: "No distance limit — all services" },
    { icon: Award, label: "10 years of experience" },
  ],
} as const;

/** Bandeau visible sur toutes les pages publiques du site. */
export function ServiceStrip({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  const items = lang === "en" ? COPY.en : COPY.fr;

  return (
    <div className={`border-b border-primary/25 bg-primary/10 ${className}`}>
      <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-3 py-2 sm:px-4">
        {items.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-foreground/80 sm:text-[11.5px] sm:tracking-[0.12em]"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
