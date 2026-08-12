import { Link, useLocation } from "@tanstack/react-router";
import { Phone, Menu, X, UserCircle2 } from "lucide-react";
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
    { to: "/", label: t("nav.home") },
    { to: "/services", label: t("nav.services") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/a-propos", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 sm:h-20 sm:px-4 lg:flex lg:justify-between lg:gap-5 xl:gap-6">
        <Link
          to="/"
          className="flex min-w-0 items-center leading-none lg:shrink-0"
          onClick={() => setOpen(false)}
          aria-label="Access Prestige Taxi"
        >
          <span className="truncate whitespace-nowrap lg:overflow-visible font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground sm:text-sm sm:tracking-[0.12em] lg:text-base lg:tracking-[0.2em]">
            Access <span className="text-primary">Prestige</span> Taxi
          </span>
        </Link>

        <nav className="hidden items-center gap-4 lg:flex xl:gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="whitespace-nowrap text-[13px] font-medium text-foreground/80 transition hover:text-primary lg:text-sm"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-1.5 lg:flex xl:gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          {DRIVERS.map((d) => (
            <a
              key={d.tel}
              href={`tel:${d.tel}`}
              aria-label={`Appeler ${d.name} au ${d.display}`}
              className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border px-2 py-2 text-xs font-semibold transition hover:border-primary xl:inline-flex 2xl:px-3"
            >
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span className="flex flex-col items-start leading-tight">
                <span className="hidden text-[10px] uppercase tracking-[0.14em] text-muted-foreground 2xl:block">
                  {d.name}
                </span>
                <span className="tabular-nums text-[11px] 2xl:text-xs">{d.display}</span>
              </span>
            </a>
          ))}
          <Link
            to="/client/login"
            aria-label="Espace client"
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border px-2.5 py-2 text-sm font-semibold transition hover:border-primary lg:px-3"
          >
            <UserCircle2 className="h-4 w-4 shrink-0 text-primary" />
            <span className="hidden xl:inline">{t("nav.account")}</span>
          </Link>
          <Link
            to="/reservation"
            className="shrink-0 whitespace-nowrap rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground lg:px-4 shadow-[var(--shadow-gold)] transition hover:opacity-90"
          >
            {t("nav.book")}
          </Link>
        </div>

        <div className="site-header-mobile-actions flex min-w-0 shrink-0 items-center gap-1 lg:hidden">
          {DRIVERS.map((d) => (
            <a
              key={d.tel}
              href={`tel:${d.tel}`}
              aria-label={`Appeler ${d.name} au ${d.display}`}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-md bg-primary px-1.5 text-[10px] font-bold uppercase tracking-tight text-primary-foreground xs:px-2 xs:text-[11px]"
            >
              <Phone className="h-3.5 w-3.5" />
              {d.name}
            </a>
          ))}
          <span className="hidden sm:contents">
            <ThemeToggle className="h-10 w-10 shrink-0" />
          </span>
          <LanguageSwitcher className="site-header-language shrink-0" />
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="flex flex-col px-4 py-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-primary" }}
                onClick={() => setOpen(false)}
                className="border-b border-border/50 py-3.5 text-base font-medium text-foreground/85"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-4 mb-3 flex flex-col gap-2.5">
              {DRIVERS.map((d) => (
                <a
                  key={d.tel}
                  href={`tel:${d.tel}`}
                  aria-label={`Appeler ${d.name} au ${d.display}`}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-border px-3 py-3 text-base font-semibold"
                >
                  <Phone className="h-5 w-5 shrink-0 text-primary" />
                  <span className="tabular-nums">
                    {d.name} · {d.display}
                  </span>
                </a>
              ))}
              <Link
                to="/client/login"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-3 text-base font-semibold"
              >
                <UserCircle2 className="h-5 w-5 text-primary" /> {t("nav.account")}
              </Link>
              <Link
                to="/reservation"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground"
              >
                {t("nav.book_long")}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
