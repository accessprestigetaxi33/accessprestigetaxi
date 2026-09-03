import { Link, useLocation } from "@tanstack/react-router";
import {
  CalendarDays,
  Menu,
  X,
  UserCircle2,
  Home,
  FileText,
  Tag,
  Mail,
  Info,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useT } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import { Phone } from "lucide-react";

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
      className="sticky top-0 z-40 bg-[#030a13]/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl border-b border-[#d6a83d]/25"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-20 sm:gap-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="site-header-logo min-w-0 flex-1 leading-none lg:flex-none lg:shrink-0"
          onClick={() => setOpen(false)}
          aria-label={t("aria.logo_home")}
        >
          <span className="block font-display text-base font-extrabold uppercase tracking-[0.18em] text-[#e8bd5d] sm:text-lg">
            Access Prestige
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.34em] text-white/70 sm:text-xs">
            Taxi
          </span>
        </Link>


        <nav aria-label={t("aria.nav_main")} className="hidden items-center gap-5 lg:flex xl:gap-7">
          {links.slice(2).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-[#e8bd5d]" }}
              className="text-sm font-medium text-white/75 transition hover:text-[#e8bd5d]"
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
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white/85 transition hover:text-[#e8bd5d]"
          >
            <UserCircle2 className="h-4 w-4 text-[#e8bd5d]" />
            <span className="hidden xl:inline">{t("nav.account")}</span>
          </Link>
          <Link
            to="/reserver"
            className="rounded-lg bg-gradient-to-b from-[#f6cd6b] to-[#cf962a] px-4 py-2.5 text-sm font-extrabold text-[#181107] shadow-[0_0_24px_rgba(214,168,61,.25)] transition hover:opacity-90"
          >
            {t("nav.book")}
          </Link>
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <Link
            to="/reserver"
            aria-label={t("nav.book")}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#d6a83d]/45 px-2.5 text-[10px] font-bold text-[#e8bd5d]"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Réserver
          </Link>
          <LanguageSwitcher className="shrink-0" />
          <button
            type="button"
            aria-label={open ? t("aria.close_menu") : t("aria.open_menu")}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d6a83d]/45 bg-[#0b1520]"
          >
            {open ? (
              <X className="h-5 w-5 text-[#e8bd5d]" />
            ) : (
              <Menu className="h-5 w-5 text-[#e8bd5d]" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden">
          <div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-[#d6a83d]/45 bg-[#030a13] shadow-[0_24px_70px_rgba(0,0,0,.55)]">
            <nav aria-label={t("aria.nav_mobile")} className="divide-y divide-white/10 px-3 py-2">
              {links.map((l) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    activeProps={{ className: "text-[#e8bd5d] bg-[#d6a83d]/5" }}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-sm font-medium text-white/85"
                  >
                    <Icon className="h-4 w-4 text-[#e8bd5d]" />
                    <span className="flex-1">{l.label}</span>
                    <ChevronRight className="h-4 w-4 text-white/40" />
                  </Link>
                );
              })}
            </nav>
            <div className="grid gap-2 border-t border-white/10 p-3">
              {DRIVERS.map((d) => (
                <a
                  key={d.tel}
                  href={`tel:${d.tel}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d6a83d]/45 px-3 text-sm font-semibold text-[#e8bd5d]"
                >
                  <Phone className="h-4 w-4" /> {d.name} · {d.display}
                </a>
              ))}
              <Link
                to="/client/login"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 text-sm font-semibold text-white/85"
              >
                <UserCircle2 className="h-4 w-4 text-[#e8bd5d]" /> {t("nav.account")}
              </Link>
              <Link
                to="/reserver"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#f6cd6b] to-[#cf962a] px-4 text-sm font-extrabold text-[#181107]"
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
