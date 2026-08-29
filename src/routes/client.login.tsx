import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, Phone, ShieldCheck, Clock3, HeartHandshake } from "lucide-react";
import { BrandLoader } from "@/components/BrandLoader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ClientAuthHeader } from "@/components/ClientAuthHeader";
import { clientLogin, clientRegister } from "@/lib/client-auth.functions";
import { setClientSession, getClientSession } from "@/lib/client-session";
import { useI18n, useT } from "@/i18n/I18nProvider";
import logo from "@/assets/tcb-logo-badge.webp";
import heroCars from "@/assets/hero-brouage-q6-bmw-vclass.webp";

// ── Global styles — déclinaison de la homepage : noir profond + doré premium ──
const css = `
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
  html, body { margin: 0; padding: 0; min-height: 100%; }
  body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #030506; }
  input, textarea, select, button { font: inherit; }
  input, textarea, select { font-size: 16px; }
  .cl-root { min-height: 100dvh; color: #fff; background: #030506; position: relative; overflow-x: hidden; }
  .cl-bg { position: fixed; inset: 0; z-index: 0; background: radial-gradient(circle at 50% 35%, rgba(224,184,102,.11), transparent 32%), linear-gradient(180deg, rgba(3,5,6,.82), #030506 88%); }
  .cl-bg img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center; opacity:.18; filter:saturate(.8) contrast(1.08); }
  .cl-header { position:relative; z-index:2; display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid rgba(224,184,102,.18); background:rgba(3,5,6,.72); backdrop-filter:blur(16px); }
  .cl-main { position:relative; z-index:1; min-height:calc(100dvh - 77px); display:flex; flex-direction:column; justify-content:center; padding:44px 20px 28px; }
  .cl-panel { width:min(100%, 460px); margin:0 auto; border:1px solid rgba(224,184,102,.28); border-radius:22px; background:linear-gradient(180deg, rgba(12,14,16,.94), rgba(5,7,8,.94)); box-shadow:0 28px 80px rgba(0,0,0,.55); }
  .cl-field { transition:border-color .2s, box-shadow .2s; }
  .cl-field:focus-within { border-color:rgba(224,184,102,.72) !important; box-shadow:0 0 0 3px rgba(224,184,102,.08); }
  .cl-benefits { width:min(100%, 820px); margin:28px auto 0; display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid rgba(224,184,102,.16); border-bottom:1px solid rgba(224,184,102,.12); }
  .cl-benefit { border-right:1px solid rgba(224,184,102,.12); }
  .cl-benefit:last-child { border-right:0; }
  @media (max-width: 640px) {
    .cl-header { padding:14px 16px; }
    .cl-main { min-height:calc(100dvh - 62px); padding:30px 14px 22px; }
    .cl-panel { border-radius:18px; padding:20px !important; }
    .cl-benefits { grid-template-columns:1fr; }
    .cl-benefit { border-right:0 !important; border-bottom:1px solid rgba(224,184,102,.12); }
    .cl-benefit:last-child { border-bottom:0; }
  }
`;
export const Route = createFileRoute("/client/login")({
  head: () => ({
    meta: [
      { title: "Mon Espace Client — Access Prestige Taxi" },
      {
        name: "description",
        content:
          "Connectez-vous à votre espace client Access Prestige Taxi pour suivre vos courses et gérer vos réservations.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#000000" },
    ],
  }),
  component: ClientLoginPage,
});

type Mode = "login" | "register";

const COPY = {
  fr: {
    backSite: "← Site",
    secure: "Connexion sécurisée",
    benefit1: "Sécurisé",
    benefit1Text: "Vos données sont protégées",
    benefit2: "Personnalisé",
    benefit2Text: "Suivi de vos courses et préférences",
    benefit3: "Disponible 24/7",
    benefit3Text: "Réservez à tout moment",
  },
  en: {
    backSite: "← Website",
    secure: "Secure connection",
    benefit1: "Secure",
    benefit1Text: "Your data is protected",
    benefit2: "Personalised",
    benefit2Text: "Ride history and preferences",
    benefit3: "Available 24/7",
    benefit3Text: "Book whenever you need",
  },
} as const;

function ClientLoginPage() {
  const navigate = useNavigate();
  const t = useT();
  const { dir, lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getClientSession()) navigate({ to: "/client/dashboard" });
  }, [navigate]);

  function validate(): string | null {
    if (!email.trim()) return t("client.login.err_email_req");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return t("client.login.err_email_invalid");
    if (!password) return t("client.login.err_pwd_req");
    if (password.length < 6) return t("client.login.err_pwd_short");
    if (mode === "register") {
      if (!name.trim()) return t("client.login.err_name_req");
      if (!phone.trim() || phone.trim().length < 6) return t("client.login.err_phone_req");
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const session =
        mode === "login"
          ? await clientLogin({ data: { email: email.trim(), password } })
          : await clientRegister({ data: { email: email.trim(), password, name: name.trim(), phone: phone.trim() } });
      setClientSession(session);
      navigate({ to: "/client/dashboard" });
    } catch (err) {
      const raw = String((err as Error)?.message || err);
      if (raw.includes("EMAIL_TAKEN")) setError(t("client.login.err_email_taken"));
      else if (raw.includes("INVALID_CREDENTIALS")) setError(t("client.login.err_credentials"));
      else if (raw.includes("CREATE_FAILED")) setError(t("client.login.err_create"));
      else setError(t("client.login.err_generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            css +
            "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');",
        }}
      />
      <div className="cl-root" dir={dir}>
        <div className="cl-bg" aria-hidden="true">
          <img src={heroCars} alt="" />
        </div>
        <header className="cl-header">
          <Link to="/" aria-label={c.backSite} className="shrink-0">
            <img src={logo} alt="Access Prestige Taxi" className="h-12 w-auto object-contain sm:h-14" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 sm:inline">
              {c.secure}
            </span>
            <LanguageSwitcher />
          </div>
        </header>

        <main className="cl-main">
          <div className="mx-auto mb-6 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e0b866]">Access Prestige Taxi</p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-wide text-white sm:text-4xl">
              {t("client_login_title")}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/55">
              {mode === "login" ? t("client_login_subtitle") : t("client_register_title")}
            </p>
          </div>

          <div className="cl-panel p-6 sm:p-7">
            <div className="mb-6 grid grid-cols-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`relative py-3 text-sm font-semibold transition ${mode === "login" ? "text-[#e8c96d]" : "text-white/45 hover:text-white"}`}
              >
                {lang === "en" ? "Sign in" : "Connexion"}
                {mode === "login" && <span className="absolute inset-x-8 -bottom-px h-0.5 bg-[#e0b866]" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={`relative py-3 text-sm font-semibold transition ${mode === "register" ? "text-[#e8c96d]" : "text-white/45 hover:text-white"}`}
              >
                {lang === "en" ? "Create account" : "Inscription"}
                {mode === "register" && <span className="absolute inset-x-8 -bottom-px h-0.5 bg-[#e0b866]" />}
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-3.5">
              {mode === "register" && (
                <>
                  <Field icon={<User className="h-4 w-4" />}>
                    <input
                      type="text"
                      inputMode="text"
                      autoComplete="name"
                      placeholder={t("client_name_field")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </Field>
                  <Field icon={<Phone className="h-4 w-4" />}>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder={t("client_phone_field")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </Field>
                </>
              )}
              <Field icon={<Mail className="h-4 w-4" />}>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t("client_email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                />
              </Field>
              <Field icon={<Lock className="h-4 w-4" />}>
                <input
                  type={showPwd ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder={t("client_password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                />
                <button
                  type="button"
                  aria-label={showPwd ? t("client.login.hide") : t("client.login.show")}
                  onClick={() => setShowPwd((v) => !v)}
                  className="ml-2 text-white/35 transition hover:text-[#e0b866]"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Field>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "rgba(239,68,68,.35)", background: "rgba(239,68,68,.1)", color: "#fca5a5" }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-[#e0b866] bg-[#e0b866] text-sm font-bold uppercase tracking-wider text-black shadow-[0_10px_30px_rgba(201,168,76,.22)] transition hover:brightness-105 active:scale-[.99] disabled:opacity-60"
              >
                {loading ? (
                  <BrandLoader size={22} />
                ) : mode === "login" ? (
                  t("client_login_btn")
                ) : (
                  t("client_register_btn")
                )}
              </button>
            </form>

            {mode === "login" && (
              <Link
                to="/client/forgot-password"
                className="mt-4 block text-right text-xs font-medium text-[#e0b866] transition hover:text-white"
              >
                {t("client.login.forgot")}
              </Link>
            )}

            <p className="mt-6 text-center text-xs text-white/45">
              {mode === "login"
                ? lang === "en"
                  ? "Not a client yet?"
                  : "Pas encore de compte ?"
                : lang === "en"
                  ? "Already have an account?"
                  : "Vous avez déjà un compte ?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError(null);
                }}
                className="font-semibold text-[#e8c96d] hover:text-white"
              >
                {mode === "login" ? t("client_register_link") : t("client_login_btn")}
              </button>
            </p>
          </div>

          <div className="cl-benefits">
            <Benefit icon={<ShieldCheck />} title={c.benefit1} text={c.benefit1Text} />
            <Benefit icon={<HeartHandshake />} title={c.benefit2} text={c.benefit2Text} />
            <Benefit icon={<Clock3 />} title={c.benefit3} text={c.benefit3Text} />
          </div>

          <p className="mx-auto mt-6 max-w-xl text-center text-[11px] leading-relaxed text-white/30">
            {t("client.login.terms_prefix")}{" "}
            <Link to="/mentions-legales" className="underline hover:text-white/55">
              {t("client.login.terms_link")}
            </Link>
            .
          </p>
        </main>
      </div>
    </>
  );
}
function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label
      className="cl-field flex h-[52px] items-center gap-2.5 rounded-xl px-3.5"
      style={{ background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.11)" }}
    >
      <span className="text-[#e0b866]/75">{icon}</span>
      {children}
    </label>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="cl-benefit flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e0b866]/70 text-[#e0b866]">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-5 w-5" })}
      </span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/75">{title}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-white/40">{text}</p>
      </div>
    </div>
  );
}
