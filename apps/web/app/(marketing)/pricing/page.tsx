import Link from "next/link";
import { Badge, Button, Card, CardDescription, CardMeta, CardTitle, SectionHeader } from "@xake/ui";

export const metadata = { title: "Pricing — XAKE" };

export default function PricingPage() {
  return (
    <div style={{ padding: "64px 28px" }}>
      <div className="mkt-container">
        <SectionHeader
          eyebrow="Pricing"
          title="Free to use today"
          description="XAKE is in preview. Paper mode is the product. Pricing lands when live-trading partners and licensed data feeds do — and we will be honest about what each tier includes."
        />

        <div className="mkt-grid mkt-grid--2" style={{ marginTop: "var(--space-6)" }}>
          <Card>
            <CardMeta>Today</CardMeta>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Free. Paper trading, mock feeds, optional public crypto feed, AI assistant when the key is configured.
            </CardDescription>
            <div style={{ display: "inline-flex", gap: 8, marginTop: 8 }}>
              <Link href="/app"><Button variant="primary">Open workspace</Button></Link>
              <Badge tone="warning">Paper environment only</Badge>
            </div>
          </Card>
          <Card>
            <CardMeta>V1.5</CardMeta>
            <CardTitle>Pro (indicative)</CardTitle>
            <CardDescription>
              Licensed real-time feeds, persistent workspace layouts, conversation persistence, team seats, and priority alert delivery. Price to be confirmed alongside vendor contracts — no fake numbers on this page.
            </CardDescription>
            <Badge tone="info">Dependent on licensing</Badge>
          </Card>
          <Card>
            <CardMeta>V2</CardMeta>
            <CardTitle>Live routing</CardTitle>
            <CardDescription>
              Broker-connected order routing through licensed partners. Subject to regulatory posture in each jurisdiction. Nothing here today. If you see live routing advertised as shipped, ask us to take it down.
            </CardDescription>
            <Badge tone="negative">Not available</Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}
