import { Badge, Card, CardDescription, CardMeta, CardTitle, SectionHeader } from "@xake/ui";

export const metadata = { title: "Security — XAKE" };

export default function SecurityPage() {
  return (
    <div style={{ padding: "64px 28px" }}>
      <div className="mkt-container">
        <SectionHeader
          eyebrow="Trust"
          title="Security posture"
          description="How XAKE handles secrets, boundaries, and the honesty of what we ship. If a control isn't in place, it's listed as such."
        />

        <h2 className="xake-micro-label" style={{ color: "var(--colour-accent)", marginTop: "var(--space-6)" }}>In place today</h2>
        <div className="mkt-grid" style={{ marginBottom: "var(--space-10)" }}>
          <Card>
            <CardMeta>Secrets</CardMeta>
            <CardTitle>Server-only</CardTitle>
            <CardDescription>
              Model and provider keys never reach the browser. All AI traffic goes through the Hono API on the server.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Live execution</CardMeta>
            <CardTitle>Hard-disabled</CardTitle>
            <CardDescription>
              The orders endpoint rejects any non-paper environment. `ExecutionVenue` is a reserved interface with no implementation.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Structured outputs</CardMeta>
            <CardTitle>Zod-validated</CardTitle>
            <CardDescription>
              Every assistant draft passes schema validation server-side and again on confirm. No unchecked JSON ever becomes an action.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Auth</CardMeta>
            <CardTitle>Clerk-ready</CardTitle>
            <CardDescription>
              Middleware scopes `/app/*` to signed-in users when Clerk is configured. User id passes to the Hono app via request header.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>CORS</CardMeta>
            <CardTitle>Origin-scoped</CardTitle>
            <CardDescription>
              The API allows requests only from `APP_URL` (plus localhost for dev). Widen via `ALLOWED_ORIGINS`.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Cron</CardMeta>
            <CardTitle>Shared secret</CardTitle>
            <CardDescription>
              Cron endpoints require `CRON_SECRET` when set. Vercel sends a Bearer token matching this value.
            </CardDescription>
          </Card>
        </div>

        <h2 className="xake-micro-label" style={{ color: "var(--colour-warning)" }}>Not yet</h2>
        <div className="mkt-grid">
          <Card>
            <CardMeta>Row-level security</CardMeta>
            <CardTitle>Postgres RLS</CardTitle>
            <CardDescription>
              Schema is designed for per-account RLS (every user-owned row carries `account_id`). Policies enable once the repository is primary.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Step-up auth</CardMeta>
            <CardTitle>For future live flows</CardTitle>
            <CardDescription>
              Reserved for the moment a live broker is wired. Required before any real-money action can be exposed.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Observability</CardMeta>
            <CardTitle>Tracing and error capture</CardTitle>
            <CardDescription>
              Platform adapter exists (`ConsoleObservability`). OTel and Sentry integrations land in the hardening stage.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Compliance</CardMeta>
            <CardTitle>Audit ledger durability</CardTitle>
            <CardDescription>
              Audit events emit in-memory today. Once Postgres is primary, the `audit_events` table is append-only and becomes the source of truth.
            </CardDescription>
          </Card>
        </div>

        <div style={{ marginTop: "var(--space-10)", display: "flex", gap: 10 }}>
          <Badge tone="warning">Paper-only</Badge>
          <Badge tone="info">No real-money flows</Badge>
          <Badge tone="accent">AI, server-side only</Badge>
        </div>
      </div>
    </div>
  );
}
