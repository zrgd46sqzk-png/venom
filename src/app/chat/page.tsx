"use client";

import { useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: "assistant", content: assistantText }]);
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setMessages([...nextMessages, { role: "assistant", content: `Error: ${message}` }]);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-6 py-6 min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <p className="text-black/50 dark:text-white/50 text-sm">
            Ask Venom anything to get started.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap rounded-2xl px-4 py-3 max-w-[85%] ${
              m.role === "user"
                ? "ml-auto bg-foreground text-background"
                : "bg-black/5 dark:bg-white/10"
            }`}
          >
            {m.content || (isStreaming && i === messages.length - 1 ? "…" : "")}
          </div>
        ))}
      </div>
      <form
        className="flex gap-2 pt-2 border-t border-black/10 dark:border-white/10"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          className="flex-1 rounded-full border border-black/15 dark:border-white/20 bg-transparent px-4 py-2 outline-none"
          placeholder="Message Venom…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
