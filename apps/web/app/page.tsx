export default function Page() {
  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="mark" aria-hidden>◪</span>
          <span className="wordmark">XAKE</span>
        </div>
        <div className="env-badge" role="status" aria-live="polite">
          <span className="env-dot" aria-hidden />
          PAPER ENVIRONMENT
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">Stage 0 — scaffold</p>
        <h1>Trade with edge, not noise.</h1>
        <p className="lede">
          XAKE is a dark, terminal-grade trading cockpit. This build is the scaffold — the
          workspace, design system, data core, paper engine, and AI assistant arrive in later stages.
        </p>
        <ul className="checklist" aria-label="Stage 0 checklist">
          <li>Monorepo wired with pnpm workspaces</li>
          <li>Web, API, and worker apps scaffolded</li>
          <li>Design, data, trading, and AI packages reserved</li>
          <li>Paper environment pinned as default</li>
        </ul>
      </section>

      <footer className="statusbar">
        <span>feed: offline</span>
        <span>session: local</span>
        <span>timezone: system</span>
        <span>build: stage-0</span>
      </footer>
    </main>
  );
}
