import Link from "next/link";

const rules = [
  {
    title: "No live money.",
    body: "There is no execution path to a real broker. The paper engine is the only engine, and the environment badge is never hidden.",
  },
  {
    title: "Secrets stay server-side.",
    body: "Provider and model credentials are read only inside Route Handlers. Nothing ever enters a client bundle.",
  },
  {
    title: "Cron endpoints are authenticated.",
    body: "Scheduled tasks must present Bearer $CRON_SECRET in production. Unauthenticated calls are rejected before any work runs.",
  },
  {
    title: "AI drafts. Humans confirm.",
    body: "The assistant can analyse, explain, screen and draft. It never places orders or creates alerts on its own. Every mutation is a human action.",
  },
  {
    title: "Validation at every boundary.",
    body: "Zod schemas validate env vars, API bodies and AI-produced structured outputs. Out-of-schema data is rejected, not coerced.",
  },
  {
    title: "No unlicensed realtime data in production.",
    body: "Free public exchange WebSockets are fair game for display. Redistribution and equities L2 data require licences we do not pretend to hold.",
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="flex h-14 items-center justify-between border-b border-mute-10 px-6">
        <Link href="/" className="font-mono text-[10px] uppercase tracking-caps text-mute-50 hover:text-fg">
          ← Back
        </Link>
        <Link href="/app" className="bg-accent px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-caps text-accent-ink">
          Open cockpit
        </Link>
      </header>

      <section className="border-b border-mute-10 px-6 py-20">
        <div className="eyebrow">Security posture · honest by default</div>
        <h1 className="mt-3 font-sans text-[clamp(36px,5vw,72px)] font-light leading-[1] tracking-tightest">
          What we <em className="not-italic font-medium">will not</em> do.
        </h1>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2">
        {rules.map((r, i) => (
          <div
            key={r.title}
            className={`p-10 ${i !== 0 ? "border-t border-mute-10" : ""} ${i % 2 === 1 ? "md:border-l" : ""} ${i > 1 ? "md:border-t" : i === 1 ? "md:border-t-0" : ""}`}
          >
            <div className="eyebrow mb-4">Rule · {String(i + 1).padStart(2, "0")}</div>
            <div className="font-sans text-[22px] font-medium tracking-crisp">{r.title}</div>
            <p className="mt-3 font-mono text-[11px] uppercase leading-[1.8] tracking-caps text-mute-50">
              {r.body}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
