import { Link, useLocation } from "@tanstack/react-router";
import { Phone, Menu, X, UserCircle2, CalendarDays, Home, FileText, Tag, Mail, Info, ChevronRight } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useT } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";

export function SiteHeader() {
  const t = useT();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  if (location.pathname === "/driver") return null;

  const links = [
    { to: "/", label: "Accueil", icon: Home },
    { to: "/reserver", label: t("nav.book"), icon: CalendarDays },
    { to: "/blog", label: t("nav.blog"), icon: FileText },
    { to: "/a-propos", label: t("nav.about"), icon: Info },
    { to: "/devis", label: t("nav.quote"), icon: Tag },
    { to: "/contact", label: t("nav.contact"), icon: Mail },
  ] as const;

  return (
    <header
      aria-label={t("aria.header")}
      className="sticky top-0 z-40 border-b border-primary/15 bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link to="/" className="min-w-0 leading-none" onClick={() => setOpen(false)} aria-label={t("aria.logo_home")}>
          <span className="block truncate font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground sm:text-sm lg:text-base">
            Access <span className="text-primary">Prestige</span> Taxi
          </span>
          <span className="mt-1 block text-[7px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[8px]">
            L'excellence à chaque trajet
          </span>
        </Link>

        <nav aria-label={t("aria.nav_main")} className="hidden items-center gap-5 lg:flex xl:gap-7">
          {links.slice(2).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-primary" }}
              className="text-sm font-medium text-foreground/75 transition hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <LanguageSwitcher />
          <Link
            to="/client/login"
            aria-label={t("aria.client_space")}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition hover:text-primary"
          >
            <UserCircle2 className="h-4 w-4 text-primary" />
            <span className="hidden xl:inline">{t("nav.account")}</span>
          </Link>
          <Link
            to="/reserver"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90"
          >
            {t("nav.book")}
          </Link>
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <a
            href={`tel:${DRIVERS[0]?.tel ?? ""}`}
            aria-label={`Appeler ${DRIVERS[0]?.name ?? "Access Prestige Taxi"}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-primary/40 px-2.5 text-[10px] font-bold text-primary"
          >
            <Phone className="h-3.5 w-3.5" />
            Appeler
          </a>
          <LanguageSwitcher className="shrink-0" />
          <button
            type="button"
            aria-label={open ? t("aria.close_menu") : t("aria.open_menu")}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-card/60"
          >
            {open ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5 text-primary" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden">
          <div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-[0_24px_70px_rgba(0,0,0,.45)]">
            <nav aria-label={t("aria.nav_mobile")} className="divide-y divide-border/70 px-3 py-2">
              {links.map((l) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    activeProps={{ className: "text-primary bg-primary/5" }}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-sm font-medium text-foreground/85"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="flex-1">{l.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </nav>
            <div className="grid gap-2 border-t border-border p-3">
              {DRIVERS.map((d) => (
                <a
                  key={d.tel}
                  href={`tel:${d.tel}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/30 px-3 text-sm font-semibold"
                >
                  <Phone className="h-4 w-4 text-primary" /> {d.name} · {d.display}
                </a>
              ))}
              <Link
                to="/client/login"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold"
              >
                <UserCircle2 className="h-4 w-4 text-primary" /> {t("nav.account")}
              </Link>
              <Link
                to="/reserver"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                <CalendarDays className="h-4 w-4" /> {t("nav.book_long")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
