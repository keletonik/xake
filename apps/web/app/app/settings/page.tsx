"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardMeta,
  CardTitle,
  EmptyState,
  Input,
  Panel,
  SectionHeader,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeToggle
} from "@xake/ui";
import { api } from "../../../lib/api-client";

interface Preferences {
  theme: "dark" | "darker" | "light" | "system";
  timezone?: string;
  defaultSymbol: string;
  defaultTimeframe: string;
  aiEnabled: boolean;
  aiPremiumReasoning: boolean;
  notificationsInApp: boolean;
  notificationsEmail: boolean;
  notificationsWebhook?: string;
  paperStartingCash: number;
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<{ preferences: Preferences }>("/v1/preferences")
      .then((r) => setPrefs(r.preferences))
      .catch(() => setPrefs(null));
  }, []);

  const save = async (patch: Partial<Preferences>) => {
    if (!prefs) return;
    setSaving(true);
    try {
      const r = await api.patch<{ preferences: Preferences }>("/v1/preferences", patch);
      setPrefs(r.preferences);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  if (!prefs) {
    return (
      <SectionHeader
        eyebrow="Workspace"
        title="Settings"
        description="Loading your preferences…"
      />
    );
  }

  return (
    <>
      <SectionHeader
        eyebrow="Workspace"
        title="Settings"
        description="Workspace, data, AI, and notification preferences for your account. Changes persist per user."
        actions={
          <Badge tone={saving ? "warning" : savedAt ? "positive" : "neutral"}>
            {saving ? "saving" : savedAt ? `saved ${new Date(savedAt).toLocaleTimeString()}` : "clean"}
          </Badge>
        }
      />

      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="paper">Paper account</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <Panel title="Theme">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
              <ThemeToggle />
              <span style={{ color: "var(--colour-text-muted)", fontSize: "var(--text-dense)" }}>
                System matches your OS preference. Darker is tuned for low-light trading.
              </span>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="workspace">
          <Panel title="Defaults">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="xake-micro-label">Default symbol</span>
                <Input
                  variant="mono"
                  defaultValue={prefs.defaultSymbol}
                  onBlur={(e) => save({ defaultSymbol: e.target.value.toUpperCase() })}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="xake-micro-label">Default timeframe</span>
                <Input
                  variant="mono"
                  defaultValue={prefs.defaultTimeframe}
                  onBlur={(e) => save({ defaultTimeframe: e.target.value })}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="xake-micro-label">Timezone (IANA)</span>
                <Input
                  defaultValue={prefs.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone}
                  onBlur={(e) => save({ timezone: e.target.value })}
                />
              </label>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="paper">
          <Panel title="Paper account">
            <Card>
              <CardMeta>Starting cash</CardMeta>
              <CardTitle>
                <span className="xake-numeric">
                  {prefs.paperStartingCash.toLocaleString(undefined, { style: "currency", currency: "USD" })}
                </span>
              </CardTitle>
              <CardDescription>
                Applied on next paper reset. Reset this account from{" "}
                <a href="/app/portfolio" style={{ color: "var(--colour-accent)" }}>
                  Portfolio
                </a>
                .
              </CardDescription>
              <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <Input
                  type="number"
                  variant="mono"
                  defaultValue={prefs.paperStartingCash}
                  min={1000}
                  max={10_000_000}
                  style={{ width: 180 }}
                  onBlur={(e) => save({ paperStartingCash: Number(e.target.value) })}
                />
                <span className="xake-micro-label">USD, max 10,000,000</span>
              </div>
            </Card>
          </Panel>
        </TabsContent>

        <TabsContent value="ai">
          <Panel title="AI co-pilot">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <ToggleRow
                label="Assistant enabled"
                description="Turn the docked assistant and /app/assistant page on/off."
                value={prefs.aiEnabled}
                onChange={(v) => save({ aiEnabled: v })}
              />
              <ToggleRow
                label="Premium reasoning"
                description="Opt in to Opus 4.7 for long reasoning tasks. Costs more; uses more latency budget."
                value={prefs.aiPremiumReasoning}
                onChange={(v) => save({ aiPremiumReasoning: v })}
              />
              <Separator />
              <p style={{ color: "var(--colour-text-muted)", fontSize: "var(--text-dense)" }}>
                The assistant drafts — it never submits. Every proposed order or alert requires an explicit Accept.
              </p>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="notifications">
          <Panel title="Delivery">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <ToggleRow
                label="In-app toasts"
                description="Show alert fires, order confirmations, and assistant errors in-app."
                value={prefs.notificationsInApp}
                onChange={(v) => save({ notificationsInApp: v })}
              />
              <ToggleRow
                label="Email"
                description="Email routing is not yet configured. Stage 10 integrates a provider."
                value={prefs.notificationsEmail}
                onChange={(v) => save({ notificationsEmail: v })}
              />
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="xake-micro-label">Webhook URL (optional)</span>
                <Input
                  defaultValue={prefs.notificationsWebhook ?? ""}
                  placeholder="https://example.com/xake-alerts"
                  onBlur={(e) => save({ notificationsWebhook: e.target.value || undefined })}
                />
              </label>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="security">
          <Panel title="Security">
            <EmptyState
              title="Security surfaces land in Stage 10"
              description="Sessions, step-up auth, secret rotation logs, and RLS policy state appear here once Postgres is primary."
            />
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        padding: "10px 12px",
        border: "1px solid var(--colour-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--colour-bg-raised)"
      }}
    >
      <div>
        <div style={{ fontWeight: 500 }}>{label}</div>
        <div style={{ color: "var(--colour-text-muted)", fontSize: "var(--text-dense)" }}>{description}</div>
      </div>
      <Button size="sm" variant={value ? "primary" : "secondary"} onClick={() => onChange(!value)}>
        {value ? "On" : "Off"}
      </Button>
    </div>
  );
}
