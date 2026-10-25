import { useEffect, useState } from "react";
import { Star, Loader2, CloudOff, RefreshCw, CloudUpload, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/nova-supabase";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";
import { notifyNewReview } from "@/lib/push.functions";
import {
  queueReview,
  subscribeReviewSync,
  flushQueuedReviews,
  type QueuedReview,
  type ReviewSyncState,
} from "@/lib/review-queue";

import { Button } from "@/components/ui/button";

/** Formulaire simplifié : note en étoiles + prénom (facultatif) + avis écrit en bas. */
const COPY = {
  fr: {
    title: "Laissez votre avis",
    intro: "Notez votre course en étoiles puis écrivez votre avis. Chaque avis est relu avant publication.",
    global: "Votre note",
    name: "Votre prénom (facultatif)",
    anonymous: "Client",
    text: "Votre avis (ce qui vous a plu, ce que l'on peut améliorer)",
    submit: "Envoyer mon avis",
    errFields: "Merci de donner une note en étoiles et d'écrire votre avis.",
    errSubmit: "Envoi impossible pour le moment, réessayez.",
    success: "Merci ! Votre avis a bien été envoyé et sera publié après relecture.",
    queued:
      "Vous êtes hors ligne. Votre avis est enregistré sur cet appareil et sera envoyé automatiquement dès le retour du réseau.",
    outOf: "sur 5",
    syncQueued: "avis en attente d'envoi sur cet appareil",
    syncSending: "Envoi en cours…",
    syncSent: "Tous vos avis hors ligne ont été envoyés.",
    syncError: "Envoi impossible pour l'instant — nouvelle tentative au retour du réseau.",
    syncRetry: "Réessayer maintenant",
    syncProgress: "envoyé(s)",
  },
  en: {
    title: "Leave your review",
    intro: "Rate your ride with stars, then write your review. Every review is checked before publication.",
    global: "Your rating",
    name: "Your first name (optional)",
    anonymous: "Client",
    text: "Your review (what you liked, what we can improve)",
    submit: "Send my review",
    errFields: "Please give a star rating and write your review.",
    errSubmit: "Could not send right now, please try again.",
    success: "Thank you! Your review was sent and will be published after review.",
    queued:
      "You are offline. Your review is saved on this device and will be sent automatically when the connection returns.",
    outOf: "out of 5",
    syncQueued: "review(s) waiting to be sent from this device",
    syncSending: "Sending…",
    syncSent: "All your offline reviews have been sent.",
    syncError: "Cannot send right now — we will retry as soon as you are back online.",
    syncRetry: "Retry now",
    syncProgress: "sent",
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

function ReviewSyncStatus({ c }: { c: (typeof COPY)["fr"] | (typeof COPY)["en"] }) {
  const [state, setState] = useState<ReviewSyncState | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => subscribeReviewSync(setState), []);

  if (!state) return null;
  const { phase, pending, total, sent } = state;
  if (phase === "idle" || (pending === 0 && phase !== "sent" && phase !== "sending")) return null;

  const progress = total > 0 ? Math.round((sent / total) * 100) : phase === "sent" ? 100 : 0;
  const tone =
    phase === "sent"
      ? "border-primary/40 bg-primary/5"
      : phase === "error"
        ? "border-destructive/40 bg-destructive/5"
        : "border-border bg-muted/40";

  return (
    <div className={`mt-4 rounded-xl border p-3 text-xs ${tone}`} role="status" aria-live="polite">
      <p className="flex items-center gap-2 font-medium text-foreground">
        {phase === "sending" && <CloudUpload className="h-4 w-4 animate-pulse text-primary" aria-hidden="true" />}
        {phase === "queued" && <CloudOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
        {phase === "sent" && <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />}
        {phase === "error" && <CloudOff className="h-4 w-4 text-destructive" aria-hidden="true" />}
        {phase === "sending"
          ? `${c.syncSending} ${sent}/${total} ${c.syncProgress}`
          : phase === "sent"
            ? c.syncSent
            : phase === "error"
              ? c.syncError
              : `${pending} ${c.syncQueued}`}
      </p>
      {(phase === "sending" || phase === "sent") && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {(phase === "queued" || phase === "error") && (
        <button
          type="button"
          disabled={retrying}
          onClick={() => {
            setRetrying(true);
            void flushQueuedReviews().finally(() => setRetrying(false));
          }}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 font-medium text-foreground transition hover:border-primary disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${retrying ? "animate-spin" : ""}`} aria-hidden="true" />
          {c.syncRetry}
        </button>
      )}
    </div>
  );
}

export function ReviewForm({ onSubmitted, compact = false }: { onSubmitted?: () => void; compact?: boolean }) {
  const { lang } = useI18n();
  const c = COPY[lang === "en" ? "en" : "fr"];

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || rating < 1) {
      toast.error(c.errFields);
      return;
    }
    setLoading(true);
    const commentaire = text.trim().slice(0, 900);
    // Table "avis" — colonnes : author_name, note, commentaire, status…
    const review: QueuedReview = {
      id: crypto.randomUUID(),
      author_name: (name.trim() || c.anonymous).slice(0, 80),
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
    onSubmitted?.();
  }

  const field =
    "w-full min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <form
      onSubmit={handleSubmit}
      className={
        compact
          ? "mt-5 w-full min-w-0 text-foreground"
          : "mx-auto mt-12 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background p-6 md:p-8"
      }
    >
      {!compact && (
        <>
          <h3 className="font-display text-2xl font-semibold">{c.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{c.intro}</p>
        </>
      )}
      <ReviewSyncStatus c={c} />

      <fieldset className={compact ? "mt-2" : "mt-6"}>
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

      <div className={`grid min-w-0 gap-3 ${compact ? "mt-4" : "mt-6"}`}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder={c.name}
          aria-label={c.name}
          className={field}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={900}
          required
          rows={compact ? 3 : 5}
          placeholder={c.text}
          aria-label={c.text}
          className={field}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="mt-5 h-auto w-full rounded-xl px-6 py-3 shadow-[var(--shadow-gold)] sm:w-auto"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {c.submit}
      </Button>
    </form>
  );
}
