import { HeartPulse, Route as RouteIcon, Award } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const COPY = {
  fr: [
    { icon: HeartPulse, label: "Transport santé conventionné" },
    { icon: RouteIcon, label: "Toutes distances, en électrique" },
    { icon: Award, label: "20 ans d'expérience" },
  ],
  en: [
    { icon: HeartPulse, label: "Covered medical transport" },
    { icon: RouteIcon, label: "Any distance, fully electric" },
    { icon: Award, label: "20 years of experience" },
  ],
} as const;

/** Bandeau visible sur toutes les pages publiques du site. */
export function ServiceStrip({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  const items = lang === "en" ? COPY.en : COPY.fr;

  return (
    <div className={`border-b border-foreground/10 ${className}`} style={{ backgroundImage: "var(--gradient-gold)" }}>
      <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-3 py-2 sm:px-4">
        {items.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-foreground sm:text-[11.5px] sm:tracking-[0.12em]"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-foreground/70" aria-hidden />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
