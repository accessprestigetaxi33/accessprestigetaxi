import { useEffect, useMemo, useState } from "react";
import { Star, Loader2, Check, CloudOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";
import { notifyNewReview } from "@/lib/push.functions";
import { queueReview, type QueuedReview } from "@/lib/review-queue";
import { Button } from "@/components/ui/button";

/** Questionnaire professionnel : note globale + critères détaillés + avis écrit. */
const CRITERIA = [
  { id: "ponctualite", fr: "Ponctualité", en: "Punctuality" },
  { id: "proprete", fr: "Propreté du véhicule", en: "Vehicle cleanliness" },
  { id: "conduite", fr: "Confort de conduite", en: "Driving comfort" },
  { id: "accueil", fr: "Accueil et courtoisie", en: "Welcome and courtesy" },
  { id: "prix", fr: "Rapport qualité / prix", en: "Value for money" },
] as const;

const COPY = {
  fr: {
    title: "Votre avis sur la course",
    intro:
      "Quelques secondes suffisent : notez votre course, détaillez chaque critère puis laissez un commentaire. Chaque avis est relu avant publication.",
    global: "Note globale",
    details: "Notez chaque critère",
    driver: "Quel chauffeur ?",
    driverAny: "Je ne sais plus / les deux",
    service: "Type de prestation",
    services: ["Course simple", "Gare / aéroport", "Transport médical", "Groupe / van 7 places", "Longue distance"],
    recommend: "Recommanderiez-vous Access Prestige Taxi ?",
    yes: "Oui",
    no: "Non",
    name: "Votre prénom ou nom",
    text: "Votre avis (ce qui vous a plu, ce que l'on peut améliorer)",
    submit: "Envoyer mon avis",
    errFields: "Merci d'indiquer votre nom, une note globale et un commentaire.",
    errSubmit: "Envoi impossible pour le moment, réessayez.",
    success: "Merci ! Votre avis a bien été envoyé et sera publié après relecture.",
    queued: "Vous êtes hors ligne. Votre avis est enregistré sur cet appareil et sera envoyé automatiquement dès le retour du réseau.",
    optional: "facultatif",
    outOf: "sur 5",
  },
  en: {
    title: "Your review of the ride",
    intro:
      "It only takes seconds: rate your ride, score each criterion and leave a comment. Every review is checked before publication.",
    global: "Overall rating",
    details: "Rate each criterion",
    driver: "Which driver?",
    driverAny: "Not sure / both",
    service: "Type of service",
    services: ["Standard ride", "Station / airport", "Medical transport", "Group / 7-seater van", "Long distance"],
    recommend: "Would you recommend Access Prestige Taxi?",
    yes: "Yes",
    no: "No",
    name: "Your first or last name",
    text: "Your review (what you liked, what we can improve)",
    submit: "Send my review",
    errFields: "Please provide your name, an overall rating and a comment.",
    errSubmit: "Could not send right now, please try again.",
    success: "Thank you! Your review was sent and will be published after review.",
    queued: "You are offline. Your review is saved on this device and will be sent automatically when the connection returns.",
    optional: "optional",
    outOf: "out of 5",
  },
} as const;

function Stars({
  value,
  onChange,
  label,
  size = "lg",
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  size?: "lg" | "sm";
}) {
  const [hover, setHover] = useState(0);
  const cls = size === "lg" ? "h-8 w-8" : "h-5 w-5";
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => {
        const active = (hover || value) >= i;
        return (
          <button
            type="button"
            key={i}
            role="radio"
            aria-checked={value === i}
            aria-label={`${label} — ${i}/5`}
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <Star
              className={`${cls} transition ${active ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function ReviewForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { lang } = useI18n();
  const c = COPY[lang === "en" ? "en" : "fr"];
  const isEn = lang === "en";

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [driver, setDriver] = useState("");
  const [service, setService] = useState("");
  const [recommend, setRecommend] = useState<"yes" | "no" | "">("");
  const [loading, setLoading] = useState(false);

  const average = useMemo(() => {
    const values = Object.values(scores).filter((v) => v > 0);
    if (!values.length) return 0;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  }, [scores]);

  function buildComment(): string {
    const lines: string[] = [text.trim()];
    const detail = CRITERIA.filter((cr) => scores[cr.id])
      .map((cr) => `${isEn ? cr.en : cr.fr} ${scores[cr.id]}/5`)
      .join(" · ");
    if (detail) lines.push(detail);
    if (service) lines.push(`${c.service}: ${service}`);
    if (driver) lines.push(`${c.driver} ${driver}`);
    if (recommend) lines.push(`${c.recommend} ${recommend === "yes" ? c.yes : c.no}`);
    return lines.filter(Boolean).join("\n").slice(0, 900);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim() || rating < 1) {
      toast.error(c.errFields);
      return;
    }
    setLoading(true);
    const commentaire = buildComment();
    // Table "avis" — colonnes : author_name, note, commentaire, status…
    const review: QueuedReview = {
      id: crypto.randomUUID(),
      author_name: name.trim().slice(0, 80),
      note: rating,
      commentaire,
      status: "pending",
      queued_at: new Date().toISOString(),
    };
    const { error } = navigator.onLine
      ? await (supabase as any).from("avis").insert({
          author_name: review.author_name,
          note: review.note,
          commentaire: review.commentaire,
          status: review.status,
        })
      : { error: new Error("offline") };
    setLoading(false);
    if (error) {
      try {
        await queueReview(review);
        toast.info(c.queued, { icon: <CloudOff className="h-4 w-4" />, duration: 7000 });
      } catch {
        toast.error(c.errSubmit);
        return;
      }
    } else {
      toast.success(c.success);
      void notifyNewReview({
        data: { author_name: review.author_name, note: rating, commentaire: commentaire.slice(0, 500) },
      }).catch(() => {});
    }
    setName("");
    setText("");
    setRating(0);
    setScores({});
    setDriver("");
    setService("");
    setRecommend("");
    onSubmitted?.();
  }

  const field =
    "rounded-xl border border-border bg-background px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border bg-background p-6 md:p-8"
    >
      <h3 className="font-display text-2xl font-semibold">{c.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{c.intro}</p>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-foreground">{c.global}</legend>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Stars value={rating} onChange={setRating} label={c.global} />
          {rating > 0 && (
            <span className="text-sm text-muted-foreground">
              {rating} {c.outOf}
            </span>
          )}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-foreground">
          {c.details} <span className="font-normal text-muted-foreground">({c.optional})</span>
        </legend>
        <div className="mt-3 grid gap-3">
          {CRITERIA.map((cr) => (
            <div
              key={cr.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 px-4 py-2.5"
            >
              <span className="text-sm text-foreground">{isEn ? cr.en : cr.fr}</span>
              <Stars
                size="sm"
                value={scores[cr.id] ?? 0}
                onChange={(v) => setScores((s) => ({ ...s, [cr.id]: v }))}
                label={isEn ? cr.en : cr.fr}
              />
            </div>
          ))}
        </div>
        {average > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {isEn ? "Detailed average" : "Moyenne détaillée"} : {average}/5
          </p>
        )}
      </fieldset>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-foreground">{c.driver}</span>
          <select value={driver} onChange={(e) => setDriver(e.target.value)} className={field}>
            <option value="">{c.driverAny}</option>
            <option value="Alain">Alain</option>
            <option value="Patricia">Patricia</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-foreground">{c.service}</span>
          <select value={service} onChange={(e) => setService(e.target.value)} className={field}>
            <option value="">—</option>
            {c.services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-foreground">{c.recommend}</legend>
        <div className="mt-2 flex gap-3">
          {(["yes", "no"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={recommend === v}
              onClick={() => setRecommend(v)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                recommend === v
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {recommend === v && <Check className="h-4 w-4 text-primary" />}
              {v === "yes" ? c.yes : c.no}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          required
          placeholder={c.name}
          aria-label={c.name}
          className={field}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          required
          rows={4}
          placeholder={c.text}
          aria-label={c.text}
          className={field}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="mt-5 h-auto rounded-xl px-6 py-3 shadow-[var(--shadow-gold)]"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {c.submit}
      </Button>
    </form>
  );
}
