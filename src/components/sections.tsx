import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("mx-auto max-w-7xl px-5 py-20", className)}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  titleTop,
  titleBottom,
  subtitle,
}: {
  eyebrow: string;
  titleTop: string;
  titleBottom?: string;
  subtitle?: string;
}) {
  return (
    <header className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
        {titleTop}
        {titleBottom ? (
          <>
            <br />
            {titleBottom}
          </>
        ) : null}
      </h1>
      {subtitle ? (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      ) : null}
    </header>
  );
}

export function LegalPage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Section className="max-w-3xl">
      <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </Section>
  );
}
