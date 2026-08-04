import { createServerFn } from "@tanstack/react-start";

/**
 * Speech-to-text via Lovable AI Gateway (fallback universel).
 * Fonctionne sur iOS Safari, Firefox, Chrome, Edge — contrairement à Web Speech API.
 * Accepte un blob audio encodé en base64 (webm, mp4, wav, mp3...).
 */
export const transcribeAudio = createServerFn({ method: "POST" })
  .inputValidator((data: { base64: string; mime: string; lang?: string }) => {
    if (!data?.base64 || typeof data.base64 !== "string") throw new Error("audio_missing");
    if (data.base64.length > 20_000_000) throw new Error("audio_too_large"); // ~15MB décodé
    return data;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const mime = data.mime || "audio/webm";
    const ext =
      mime.includes("wav") ? "wav"
      : mime.includes("mp4") || mime.includes("m4a") ? "mp4"
      : mime.includes("mpeg") || mime.includes("mp3") ? "mp3"
      : mime.includes("ogg") ? "ogg"
      : "webm";

    const form = new FormData();
    form.append("model", "openai/gpt-4o-mini-transcribe");
    form.append("file", new Blob([bytes as BlobPart], { type: mime }), `recording.${ext}`);
    // Language optional — omit to let model auto-detect (safer for multi-lang site)
    if (data.lang && /^[a-z]{2}$/.test(data.lang)) form.append("language", data.lang);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[stt] gateway error", res.status, errText);
      throw new Error(`stt_failed_${res.status}`);
    }

    const json = (await res.json()) as { text?: string };
    return { text: (json.text ?? "").trim() };
  });
