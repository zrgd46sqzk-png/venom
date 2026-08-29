import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight">Venom</h1>
        <p className="text-lg text-black/70 dark:text-white/70">
          One product, two AI engines: a Claude-powered chat assistant and Seedance-powered
          text-to-video generation.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            href="/chat"
            className="rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            Start chatting
          </Link>
          <Link
            href="/video"
            className="rounded-full border border-black/15 dark:border-white/20 px-6 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
          >
            Generate a video
          </Link>
        </div>
      </div>
    </div>
  );
}
