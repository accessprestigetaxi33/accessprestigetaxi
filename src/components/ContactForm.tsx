import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const COPY = {
  fr: {
    title: "Écrivez-nous",
    sub: "Nous vous répondons dans les meilleurs délais.",
    nom: "Nom et prénom",
    email: "E-mail",
    tel: "Téléphone (facultatif)",
    sujet: "Sujet (facultatif)",
    message: "Votre message",
    placeholder: "Trajet souhaité, date, nombre de passagers, transport sanitaire conventionné, longue distance…",
    send: "Envoyer le message",
    sending: "Envoi…",
    ok: "Message envoyé ! Nous vous répondons très vite.",
    err: "L'envoi a échoué. Merci de réessayer ou de nous appeler.",
  },
  en: {
    title: "Write to us",
    sub: "We reply as quickly as possible.",
    nom: "Full name",
    email: "Email",
    tel: "Phone (optional)",
    sujet: "Subject (optional)",
    message: "Your message",
    placeholder: "Route, date, number of passengers, medical transport, long distance…",
    send: "Send message",
    sending: "Sending…",
    ok: "Message sent! We'll get back to you shortly.",
    err: "Sending failed. Please try again or call us.",
  },
} as const;

export function ContactForm() {
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState("sending");
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: String(fd.get("nom") ?? ""),
          email: String(fd.get("email") ?? ""),
          telephone: String(fd.get("telephone") ?? "") || null,
          sujet: String(fd.get("sujet") ?? "") || null,
          message: String(fd.get("message") ?? ""),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setState("ok");
      form.reset();
    } catch {
      setState("error");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-[#d6a83d]/30 bg-[#07101a] px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#e8bd5d]";

  if (state === "ok") {
    return (
      <div className="rounded-2xl border border-[#d6a83d]/45 bg-[linear-gradient(145deg,#111b26,#07101a)] p-8 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-[#e8bd5d]" />
        <p className="mt-3 font-display text-lg font-semibold text-white">{c.ok}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[#d6a83d]/45 bg-[linear-gradient(145deg,#111b26,#07101a)] p-5 sm:p-7"
    >
      <h2 className="font-display text-xl font-semibold text-[#e8bd5d] sm:text-2xl">{c.title}</h2>
      <p className="mt-1 text-sm text-white/60">{c.sub}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <input name="nom" required minLength={2} maxLength={100} placeholder={c.nom} className={inputCls} />
        <input name="email" type="email" required maxLength={255} placeholder={c.email} className={inputCls} />
        <input name="telephone" type="tel" maxLength={30} placeholder={c.tel} className={inputCls} />
        <input name="sujet" maxLength={120} placeholder={c.sujet} className={inputCls} />
      </div>

      <textarea
        name="message"
        required
        minLength={10}
        maxLength={2000}
        rows={5}
        placeholder={c.placeholder}
        className={`${inputCls} mt-3 resize-y`}
        aria-label={c.message}
      />

      {state === "error" && <p className="mt-3 text-sm font-medium text-red-400">{c.err}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#e0b866] px-6 text-sm font-semibold uppercase tracking-wider text-black transition hover:brightness-105 disabled:opacity-60 sm:w-auto"
      >
        {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {state === "sending" ? c.sending : c.send}
      </button>
    </form>
  );
}
