import { createFileRoute } from"@tanstack/react-router";
import { runReservationChat, type ReservationChatInput } from"@/lib/reserver-chat.server";
import { getLovableAiGatewayResponseHeaders, getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } from"@/lib/ai-gateway.server";
import { z } from"zod";

const RequestSchema = z.object({
 messages: z.array(z.any()),
 lang: z.enum(["fr""en"]).default("fr"),
 sessionId: z.string().default("anonymous"),
});

export const Route = createFileRoute("/api/chat")({
 server: {
 handlers: {
 POST: async ({ request }) => {
 const key = process.env.LOVABLE_API_KEY;
 if (!key) {
 return new Response("Missing LOVABLE_API_KEY"{ status: 500 });
 }

 let body: unknown;
 try {
 body = await request.json();
 } catch {
 return new Response("Invalid JSON body"{ status: 400 });
 }

 const parsed = RequestSchema.safeParse(body);
 if (!parsed.success) {
 return new Response(`Invalid request: ${parsed.error.message}`, { status: 400 });
 }

 const { messages, lang, sessionId } = parsed.data;
 const initialRunId = getLovableAiGatewayRunId(request);

 try {
 const { result, gateway } = await runReservationChat({ messages, lang, sessionId } as ReservationChatInput, request, key);
 const response = result.toUIMessageStreamResponse({
 originalMessages: messages as any,
 sendReasoning: false,
 headers: getLovableAiGatewayResponseHeaders(undefined, {...(initialRunId? {"X-Lovable-AIG-Run-ID": initialRunId }: {}),
 }),
 });
 return withLovableAiGatewayRunIdHeader(response, gateway);
 } catch (err: any) {
 console.error("[/api/chat] error"err);
 return new Response(err?.message??"Internal server error"{ status: 500 });
 }
 },
 },
 },
});
