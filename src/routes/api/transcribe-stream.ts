import { createFileRoute } from "@tanstack/react-router";

/**
 * Streaming speech-to-text proxy (SSE) — réduit la latence perçue :
 * le texte arrive au fil de l'eau au lieu d'attendre la transcription complète.
 * Fallback batch : src/lib/stt.functions.ts
 */
export const Route = createFileRoute("/api/transcribe-stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("stt_unconfigured", { status: 500 });

        let payload: { base64?: string; mime?: string; lang?: string };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return new Response("bad_json", { status: 400 });
        }
        const b64 = payload.base64;
        if (!b64 || typeof b64 !== "string") return new Response("audio_missing", { status: 400 });
        if (b64.length > 20_000_000) return new Response("audio_too_large", { status: 413 });

        let bytes: Uint8Array;
        try {
          bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        } catch {
          return new Response("audio_invalid", { status: 400 });
        }
        if (bytes.byteLength < 2048) return new Response("audio_empty", { status: 400 });

        const mime = payload.mime || "audio/wav";
        const ext =
          mime.includes("wav") ? "wav"
          : mime.includes("mp4") || mime.includes("m4a") ? "mp4"
          : mime.includes("mpeg") || mime.includes("mp3") ? "mp3"
          : mime.includes("ogg") ? "ogg"
          : "webm";

        const form = new FormData();
        form.append("model", "openai/gpt-4o-mini-transcribe");
        form.append("file", new Blob([bytes as BlobPart], { type: mime }), `recording.${ext}`);
        form.append("stream", "true");
        if (payload.lang && /^[a-z]{2}$/.test(payload.lang)) form.append("language", payload.lang);

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: form,
        });

        if (!upstream.ok || !upstream.body) {
          const errText = await upstream.text().catch(() => "");
          console.error("[stt-stream] gateway error", upstream.status, errText);
          return new Response(errText || "stt_failed", { status: upstream.status || 502 });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
