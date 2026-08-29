import { NextRequest } from "next/server";
import { getAnthropic, CHAT_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT =
  "You are Venom, a helpful AI assistant built by this product's team. Be clear, concise, and direct.";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const messages = body?.messages as ChatMessage[] | undefined;

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages is required" }, { status: 400 });
  }

  let anthropic;
  try {
    anthropic = getAnthropic();
  } catch {
    return Response.json({ error: "Server is missing ANTHROPIC_API_KEY" }, { status: 500 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const anthropicStream = anthropic.messages.stream({
          model: CHAT_MODEL,
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of anthropicStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Chat generation failed";
        controller.enqueue(encoder.encode(`\n\n[error: ${message}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
