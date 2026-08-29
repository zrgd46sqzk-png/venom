"use client";

import { useState } from "react";

type Status = "idle" | "starting" | "processing" | "succeeded" | "failed";

export default function VideoPage() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [status, setStatus] = useState<Status>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!prompt.trim() || status === "starting" || status === "processing") return;

    setStatus("starting");
    setVideoUrl(null);
    setError(null);

    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start video generation");

      setStatus("processing");
      await poll(data.id);
    } catch (err) {
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function poll(id: string) {
    for (;;) {
      await new Promise((r) => setTimeout(r, 3000));
      const res = await fetch(`/api/video/${id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to check video status");

      if (data.status === "succeeded") {
        const output = Array.isArray(data.output) ? data.output[0] : data.output;
        setVideoUrl(output);
        setStatus("succeeded");
        return;
      }
      if (data.status === "failed" || data.status === "canceled") {
        throw new Error(data.error ?? "Video generation failed");
      }
    }
  }

  const busy = status === "starting" || status === "processing";

  return (
    <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Generate a video</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mt-1">
          Describe a scene and Venom will generate a short video from it.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          generate();
        }}
      >
        <textarea
          className="w-full rounded-xl border border-black/15 dark:border-white/20 bg-transparent px-4 py-3 outline-none resize-none"
          rows={4}
          placeholder="A drone shot flying over a desert at sunset…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={busy}
        />
        <div className="flex items-center gap-4">
          <label className="text-sm text-black/60 dark:text-white/60 flex items-center gap-2">
            Duration
            <select
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-2 py-1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={busy}
            >
              <option value={5}>5s</option>
              <option value={10}>10s</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={busy || !prompt.trim()}
            className="rounded-full bg-foreground text-background px-6 py-2 text-sm font-medium disabled:opacity-40"
          >
            {busy ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {status === "processing" && (
        <p className="text-sm text-black/60 dark:text-white/60">
          Rendering your video — this can take a minute or two…
        </p>
      )}

      {videoUrl && (
        <video src={videoUrl} controls className="w-full rounded-xl border border-black/10 dark:border-white/10" />
      )}
    </div>
  );
}
