import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-5xl flex items-center gap-6 px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          Venom
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/chat" className="hover:underline">
            Chat
          </Link>
          <Link href="/video" className="hover:underline">
            Video
          </Link>
        </nav>
      </div>
    </header>
  );
}
