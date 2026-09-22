import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function createLovableAiGatewayRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  let resolveRunId: (value: string | undefined) => void = () => {};
  let runIdResolved = false;
  const runIdReady = new Promise<string | undefined>((resolve) => {
    resolveRunId = resolve;
  });

  const publishRunId = (value?: string) => {
    const nextRunId = value?.trim() || undefined;
    if (!runId && nextRunId) {
      runId = nextRunId;
    }
    if (!runIdResolved) {
      runIdResolved = true;
      resolveRunId(runId);
    }
  };
  if (runId) publishRunId(runId);

  return {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) {
        headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
      }
      try {
        const response = await fetch(input, { ...init, headers });
        publishRunId(response.headers.get(LOVABLE_AIG_RUN_ID_HEADER) ?? undefined);
        return response;
      } catch (error) {
        publishRunId(undefined);
        throw error;
      }
    },
    getRunId: () => runId,
    waitForRunId: () => (runId ? Promise.resolve(runId) : runIdReady),
  };
}

/**
 * Fournisseur IA indépendant (OpenAI direct) si `OPENAI_API_KEY` est configurée,
 * sinon passerelle IA Lovable. Les identifiants de modèles « passerelle »
 * (google/gemini-2.5-flash…) sont traduits vers leur équivalent OpenAI, pour que
 * le code appelant reste inchangé.
 */
const OPENAI_MODEL_MAP: Record<string, string> = {
  "google/gemini-2.5-flash": "gpt-4o-mini",
  "google/gemini-2.5-pro": "gpt-4o",
  "openai/gpt-4o-mini-transcribe": "gpt-4o-mini-transcribe",
  "openai/gpt-4o-mini": "gpt-4o-mini",
  "openai/gpt-4o": "gpt-4o",
};

export function mapAiModelId(modelId: string): string {
  if (!process.env["OPENAI_API_KEY"]) return modelId;
  return OPENAI_MODEL_MAP[modelId] ?? modelId.replace(/^openai\//, "");
}

/** Point d'accès transcription audio (Whisper/gpt-4o-transcribe). */
export function aiTranscriptionTarget(modelId = "openai/gpt-4o-mini-transcribe") {
  const openaiKey = process.env["OPENAI_API_KEY"];
  if (openaiKey) {
    return {
      url: "https://api.openai.com/v1/audio/transcriptions",
      headers: { Authorization: `Bearer ${openaiKey}` } as Record<string, string>,
      model: mapAiModelId(modelId),
    };
  }
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (!lovableKey) throw new Error("Missing OPENAI_API_KEY (or LOVABLE_API_KEY) for transcription");
  return {
    url: "https://ai.gateway.lovable.dev/v1/audio/transcriptions",
    headers: { Authorization: `Bearer ${lovableKey}` } as Record<string, string>,
    model: modelId,
  };
}

export function createLovableAiGatewayProvider(
  lovableApiKey: string,
  initialRunId?: string,
  options?: { structuredOutputs?: boolean },
) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);
  const openaiKey = process.env["OPENAI_API_KEY"];

  const base = openaiKey
    ? createOpenAICompatible({
        name: "openai",
        baseURL: "https://api.openai.com/v1",
        supportsStructuredOutputs: options?.structuredOutputs ?? false,
        headers: { Authorization: `Bearer ${openaiKey}` },
        fetch: runIdFetch.fetch,
      })
    : createOpenAICompatible({
        name: "lovable",
        baseURL: "https://ai.gateway.lovable.dev/v1",
        supportsStructuredOutputs: options?.structuredOutputs ?? false,
        headers: {
          "Lovable-API-Key": lovableApiKey,
          "X-Lovable-AIG-SDK": "vercel-ai-sdk",
        },
        fetch: runIdFetch.fetch,
      });

  const provider = ((modelId: string, ...rest: unknown[]) =>
    (base as any)(mapAiModelId(modelId), ...rest)) as unknown as typeof base;

  return Object.assign(provider, {
    getRunId: runIdFetch.getRunId,
    waitForRunId: runIdFetch.waitForRunId,
  });
}


export function getLovableAiGatewayRunId(request: Request) {
  return request.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
}

export function getLovableAiGatewayResponseHeaders(
  providerHeaders: HeadersInit | undefined,
  init?: HeadersInit,
) {
  const headers = new Headers(init);
  const exposedHeaders = new Set(
    (headers.get("Access-Control-Expose-Headers") ?? "")
      .split(",")
      .map((header) => header.trim())
      .filter(Boolean),
  );

  new Headers(providerHeaders).forEach((value, name) => {
    if (name.toLowerCase().startsWith("x-lovable-aig-")) {
      headers.set(name, value);
      exposedHeaders.add(name);
    }
  });

  headers.forEach((_, name) => {
    if (name.toLowerCase().startsWith("x-lovable-aig-")) {
      exposedHeaders.add(name);
    }
  });

  if (exposedHeaders.size > 0) {
    headers.set("Access-Control-Expose-Headers", Array.from(exposedHeaders).join(", "));
  }

  return headers;
}

export async function withLovableAiGatewayRunIdHeader(
  response: Response,
  gateway: { getRunId: () => string | undefined; waitForRunId: () => Promise<string | undefined> },
  init?: HeadersInit,
) {
  if (!response.body) {
    const runId = gateway.getRunId();
    const headers = getLovableAiGatewayResponseHeaders(undefined, response.headers);
    new Headers(init).forEach((value, name) => headers.set(name, value));
    if (runId) headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: getLovableAiGatewayResponseHeaders(undefined, headers),
    });
  }

  const reader = response.body.getReader();
  const firstChunk = reader.read();
  const runId = await gateway.waitForRunId();
  const headers = getLovableAiGatewayResponseHeaders(undefined, response.headers);
  new Headers(init).forEach((value, name) => headers.set(name, value));
  if (runId) headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);

  const body = new ReadableStream({
    async start(controller) {
      try {
        const first = await firstChunk;
        if (first.done) {
          controller.close();
          return;
        }
        controller.enqueue(first.value);
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          controller.enqueue(chunk.value);
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel(reason?: unknown) {
      return reader.cancel(reason);
    },
  });

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: getLovableAiGatewayResponseHeaders(undefined, headers),
  });
}
