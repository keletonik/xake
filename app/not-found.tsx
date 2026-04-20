import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-bg px-6 text-center text-fg">
      <div className="eyebrow">Error · 404</div>
      <h1 className="font-sans text-[clamp(48px,8vw,128px)] font-light leading-none tracking-tightest">
        Void.
      </h1>
      <p className="max-w-sm font-mono text-[11px] uppercase tracking-caps text-mute-50">
        Nothing at this path. Try the landing or jump into the workspace.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="border border-mute-20 px-4 py-2.5 font-mono text-[11px] uppercase tracking-caps hover:border-accent hover:text-accent"
        >
          Home
        </Link>
        <Link
          href="/app"
          className="bg-accent px-4 py-2.5 font-mono text-[11px] uppercase tracking-caps text-accent-ink"
        >
          Open cockpit
        </Link>
      </div>
    </div>
  );
}
