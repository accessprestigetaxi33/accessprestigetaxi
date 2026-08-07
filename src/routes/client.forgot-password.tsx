import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { ClientAuthHeader } from "@/components/ClientAuthHeader";
import { BrandLoader } from "@/components/BrandLoader";
import { clientRequestPasswordReset } from "@/lib/client-auth-reset.functions";
import { useT } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/client/forgot-password")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — Access Prestige Taxi" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const t = useT();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(t("client.login.err_email_invalid"));
      return;
    }
    setLoading(true);
    try {
      await clientRequestPasswordReset({ data: { email: email.trim() } });
      setSent(true);
    } catch {
      setError(t("client.login.err_generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative min-h-[100dvh] overflow-hidden px-4 py-10 sm:py-16"
      style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #111827 100%)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
      />
      <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
        <ClientAuthHeader />
        <div
          className="w-full rounded-2xl border p-6 sm:p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "rgba(255,255,255,0.10)",
            boxShadow: "0 25px 60px -20px rgba(0,0,0,0.6)",
          }}
        >
          {!sent ? (
            <>
              <h1
                className="text-center text-2xl font-bold text-foreground sm:text-3xl"
                style={{ fontFamily: "'Syne', 'Playfair Display', serif" }}
              >
                {t("client.forgot.title")}
              </h1>
              <p className="mt-2 text-center text-sm text-foreground/60">
                {t("client.forgot.desc")}
              </p>
              <form onSubmit={onSubmit} className="mt-6 space-y-3.5">
                <label
                  className="flex items-center gap-2.5 rounded-xl border px-3.5 transition focus-within:border-[var(--gold)]/60"
                  style={{ height: 50, background: "rgba(0,0,0,0.25)", borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <Mail className="h-4 w-4 text-foreground/50" />
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                </label>
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border px-3 py-2 text-sm"
                    style={{
                      borderColor: "rgba(239,68,68,0.4)",
                      background: "rgba(239,68,68,0.08)",
                      color: "#fca5a5",
                    }}
                  >
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 text-base font-semibold text-black transition active:scale-[0.98] disabled:opacity-60"
                  style={{
                    height: 52,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, var(--gold) 0%, #E8C96D 100%)",
                    boxShadow: "0 10px 30px -10px rgba(201,168,76,0.5)",
                  }}
                >
                  {loading ? <BrandLoader size={22} /> : t("client.forgot.send")}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "rgba(201,168,76,0.15)" }}>
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Syne', 'Playfair Display', serif" }}>
                {t("client.forgot.sent_title")}
              </h1>
              <p className="mt-3 text-sm text-foreground/70">
                {t("client.forgot.sent_desc")} <span className="text-primary">{email}</span>
              </p>
              <p className="mt-2 text-xs text-foreground/50">{t("client.forgot.sent_spam")}</p>
              <button
                onClick={() => navigate({ to: "/client/login" })}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-4 py-3 text-sm font-semibold text-primary"
              >
                {t("client.forgot.back_login")}
              </button>
            </div>
          )}
        </div>
        <Link
          to="/client/login"
          className="mt-6 inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> {t("client.forgot.back")}
        </Link>
      </div>
    </main>
  );
}
