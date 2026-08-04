import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useI18n } from "@/i18n/I18nProvider";
import { seoLinks } from "@/lib/seo-hreflang";
import { gaEvent } from "@/lib/ga4";
import { useServerFn } from "@tanstack/react-start";
import { transcribeAudio } from "@/lib/stt.functions";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mic, Send, X, Phone, Loader2, MapPin, CalendarDays, Users, Baby, Car } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const RESERVER_TITLE_FR = "Réserver un taxi en Charente-Maritime — Access Prestige Taxi";
const RESERVER_TITLE_EN = "Book a taxi in Charente-Maritime — Access Prestige Taxi";
const RESERVER_DESC_FR = "Réservez votre taxi en Charente-Maritime par chat ou voix en 2 minutes. Devis instantané, confirmation immédiate, suivi en direct.";
const RESERVER_DESC_EN = "Book your taxi in Charente-Maritime by chat or voice in 2 minutes. Instant quote, immediate confirmation, live tracking.";

export const Route = createFileRoute("/reserver")({
  head: () => ({
    meta: [
      { title: RESERVER_TITLE_FR },
      { name: "description", content: RESERVER_DESC_FR },
      { property: "og:title", content: RESERVER_TITLE_FR },
      { property: "og:description", content: RESERVER_DESC_FR },
      { property: "og:url", content: "https://accessprestigetaxi.lovable.app/reserver" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
      },
      { name: "theme-color", content: "#0B0B0D" },
    ],
    links: seoLinks("/reserver"),
  }),
  component: ReservationPage,
});

function ReservationPage() {
  const { lang, t, setLang } = useI18n();
  const title = lang === "en" ? RESERVER_TITLE_EN : RESERVER_TITLE_FR;
  const desc = lang === "en" ? RESERVER_DESC_EN : RESERVER_DESC_FR;

  const [confirmed, setConfirmed] = useState<{ suiviId: string; trackingLink: string } | null>(null);
  const [recording, setRecording] = useState(false);
  const [micPermission, setMicPermission] = useState<"prompt" | "granted" | "denied">("prompt");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const transcribe = useServerFn(transcribeAudio);
  const [input, setInput] = useState("");

  const transport = new DefaultChatTransport({
    api: "/api/chat",
    body: { lang },
  });

  const { messages, sendMessage, status, setMessages, error } = useChat({
    transport,
    onError: (err) => {
      console.error("[chat] error", err);
      toast.error(t("reserver.chat.error.network"));
    },
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  // Detect confirmed reservation from tool result
  useEffect(() => {
    for (const m of messages) {
      for (const part of m.parts ?? []) {
        if (part.type === "tool-invocation") {
          const ti = (part as any).toolInvocation;
          if (ti?.toolName === "confirm_reservation") {
            const result = ti.result as any;
            if (result?.ok && result.suivi_id && !confirmed) {
              setConfirmed({ suiviId: result.suivi_id, trackingLink: result.tracking_link });
              gaEvent("reservation_confirmed", { method: "chat" });
            }
          }
        }
      }
    }
  }, [messages, confirmed]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const startRecording = useCallback(async () => {
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");
      const mimeType = MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const mime = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        if (blob.size < 1024) {
          toast.error(lang === "en" ? "No voice detected" : "Aucune voix détectée");
          return;
        }
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(blob);
        });
        try {
          const res = await transcribe({ data: { base64, mime, lang } });
          if (res.text) {
            setInput(res.text);
            // Auto-send after short delay
            setTimeout(() => {
              const fakeEvent = { preventDefault: () => {} } as any;
              sendMessage({ text: input.trim() });
            }, 300);
          }
        } catch (err) {
          console.error("[stt] error", err);
          toast.error(lang === "en" ? "Voice transcription failed" : "La dictée vocale a échoué");
        }
      };
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error("[mic] error", err);
      setMicPermission("denied");
      toast.error(lang === "en" ? "Microphone access denied" : "Accès au micro refusé");
    }
  }, [setInput, sendMessage, lang, transcribe]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());
    }
    setRecording(false);
  }, []);

  const onVoiceDown = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    startRecording();
  };
  const onVoiceUp = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    stopRecording();
  };

  const isLoading = status === "submitted" || status === "streaming";

  const quickActions = [
    { icon: MapPin, label: t("reserver.chat.quick.airport"), text: lang === "en" ? "Quote from La Rochelle airport" : "Devis depuis l'aéroport de La Rochelle" },
    { icon: CalendarDays, label: t("reserver.chat.quick.train"), text: lang === "en" ? "Pick-up at La Rochelle train station" : "Prise en charge à la gare de La Rochelle" },
    { icon: Users, label: t("reserver.chat.quick.group"), text: lang === "en" ? "I need a 7-seater van" : "Je besoin d'un van 7 places" },
    { icon: Baby, label: t("reserver.chat.quick.child"), text: lang === "en" ? "I need a child/baby seat" : "Je besoin d'un siège enfant/bébé" },
  ];

  const sendQuick = (text: string) => {
    setInput(text);
    setTimeout(() => sendMessage({ text: input.trim() }), 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0B0B0D] text-[#F4F1EA]">
      <HeadMeta lang={lang} title={title} desc={desc} />

      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#C6A24A]/20 bg-[#0B0B0D]/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#C6A24A]/30 text-[#C6A24A] transition hover:bg-[#C6A24A]/10">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-lg font-semibold leading-tight text-[#C6A24A]">{t("reserver.chat.title")}</h1>
            <p className="text-xs text-[#F4F1EA]/60">{t("common.available_247")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`tel:${lang === "en" ? "+33650260015" : "0650260015"}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#C6A24A]/30 text-[#C6A24A] transition hover:bg-[#C6A24A]/10" aria-label={t("nav.contact")}>
            <Phone className="h-4 w-4" />
          </a>
          <button
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="inline-flex h-9 items-center justify-center rounded-full border border-[#C6A24A]/30 px-3 text-xs font-medium text-[#C6A24A] transition hover:bg-[#C6A24A]/10"
          >
            {lang === "en" ? "FR" : "EN"}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-4">
          <WelcomeBubble t={t} lang={lang} />

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-[#C6A24A] text-[#0B0B0D]"
                      : "rounded-bl-sm border border-[#F4F1EA]/10 bg-[#161618] text-[#F4F1EA]"
                  }`}
                >
                  <MessageContent message={m} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm border border-[#F4F1EA]/10 bg-[#161618] px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-[#C6A24A]" />
              </div>
            </div>
          )}

          {confirmed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-[#C6A24A]/30 bg-[#C6A24A]/10 p-4"
            >
              <p className="mb-2 text-sm font-medium text-[#C6A24A]">✅ {t("reserver.chat.booking_ok")}</p>
              <p className="mb-3 text-xs text-[#F4F1EA]/80">{t("reserver.chat.booking_ref")}: <span className="font-mono">{confirmed.suiviId}</span></p>
              <div className="flex flex-wrap gap-2">
                <a href={confirmed.trackingLink} className="inline-flex items-center gap-2 rounded-full bg-[#C6A24A] px-4 py-2 text-sm font-medium text-[#0B0B0D]">
                  <MapPin className="h-4 w-4" /> {t("reserver.chat.booking_track")}
                </a>
                <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-[#C6A24A]/30 px-4 py-2 text-sm text-[#C6A24A]">
                  <Car className="h-4 w-4" /> {t("nav.home")}
                </Link>
              </div>
            </motion.div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {t("reserver.chat.error.network")}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      {messages.length < 2 && (
        <div className="border-t border-[#F4F1EA]/5 bg-[#0B0B0D] px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <p className="mb-2 text-xs text-[#F4F1EA]/50">{lang === "en" ? "Quick starts" : "Démarrages rapides"}</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => sendQuick(a.text)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#C6A24A]/20 bg-[#161618] px-3 py-1.5 text-xs text-[#F4F1EA]/90 transition hover:border-[#C6A24A]/40 hover:text-[#C6A24A]"
                >
                  <a.icon className="h-3.5 w-3.5 text-[#C6A24A]" /> {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-[#C6A24A]/20 bg-[#0B0B0D] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim() || isLoading) return;
            sendMessage({ text: input.trim() });
            gaEvent("reserver_chat_message", { lang });
          }}
          className="mx-auto flex max-w-2xl items-end gap-2"
        >
          <button
            type="button"
            onPointerDown={onVoiceDown}
            onPointerUp={onVoiceUp}
            onPointerLeave={onVoiceUp}
            onMouseDown={onVoiceDown}
            onMouseUp={onVoiceUp}
            onMouseLeave={onVoiceUp}
            onTouchStart={onVoiceDown}
            onTouchEnd={onVoiceUp}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
              recording
                ? "border-red-400 bg-red-400/20 text-red-400"
                : "border-[#C6A24A]/30 text-[#C6A24A] hover:bg-[#C6A24A]/10"
            }`}
            aria-label={t("reserver.chat.hold_to_speak")}
            title={t("reserver.chat.hold_to_speak")}
          >
            {recording ? <X className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder={t("reserver.chat.placeholder")}
            disabled={isLoading}
            className="flex-1 rounded-full border-[#F4F1EA]/10 bg-[#161618] px-4 py-3 text-sm text-[#F4F1EA] placeholder:text-[#F4F1EA]/40 focus-visible:border-[#C6A24A]/50 focus-visible:ring-[#C6A24A]/20"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#C6A24A] p-0 text-[#0B0B0D] hover:bg-[#C6A24A]/90 disabled:opacity-40"
            aria-label={t("reserver.chat.send")}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <p className="mt-2 text-center text-[10px] text-[#F4F1EA]/40">
          {recording ? t("reserver.chat.speaking") : "Access Prestige Taxi · Charente-Maritime"}
        </p>
      </div>
    </div>
  );
}

function WelcomeBubble({ t, lang }: { t: (k: string) => string; lang: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-[#F4F1EA]/10 bg-[#161618] px-4 py-3 text-sm leading-relaxed text-[#F4F1EA]/90">
        <p className="mb-1 font-medium text-[#C6A24A]">Margot</p>
        <p>{t("reserver.chat.subtitle")}</p>
        <p className="mt-2 text-xs text-[#F4F1EA]/60">
          {lang === "en"
            ? "Examples: \"La Rochelle to Royan tomorrow at 2pm for 2 people\" or \"Airport pickup on Monday at 9am\"."
            : "Exemples : \"La Rochelle vers Royan demain à 14h pour 2 personnes\" ou \"Récupération à l'aéroport lundi à 9h\"."}
        </p>
      </div>
    </div>
  );
}

function MessageContent({ message }: { message: any }) {
  return (
    <div className="space-y-2">
      {message.parts.map((part: any, idx: number) => {
        if (part.type === "text") {
          return <p key={idx}>{part.text}</p>;
        }
        if (part.type === "tool-invocation") {
          const ti = part.toolInvocation;
          if (ti.state === "result") {
            if (ti.toolName === "compute_quote" && ti.result?.prix_estime) {
              return (
                <div key={idx} className="rounded-xl bg-[#0B0B0D]/60 p-2 text-xs">
                  <p className="text-[#C6A24A]">💶 {ti.result.prix_estime.toFixed(2)} €</p>
                  <p className="text-[#F4F1EA]/60">{ti.result.distance_km} km · {ti.result.duree_min} min</p>
                </div>
              );
            }
            if (ti.toolName === "check_slot") {
              return (
                <div key={idx} className="rounded-xl bg-[#0B0B0D]/60 p-2 text-xs">
                  <p className={ti.result.available ? "text-green-400" : "text-amber-400"}>
                    {ti.result.available ? "✓" : "⚠"} {ti.result.reason}
                  </p>
                </div>
              );
            }
            if (ti.toolName === "human_handoff") {
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <p>{ti.result.message}</p>
                  <p><a href={`tel:${ti.result.phone?.split("/")[0]?.trim()}`} className="text-[#C6A24A]">{ti.result.phone}</a></p>
                </div>
              );
            }
          }
          return null;
        }
        return null;
      })}
    </div>
  );
}

function HeadMeta({ lang, title, desc }: { lang: string; title: string; desc: string }) {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", desc);
    document.documentElement.lang = lang;
  }, [lang, title, desc]);
  return null;
}
