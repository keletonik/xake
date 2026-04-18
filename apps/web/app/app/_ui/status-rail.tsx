"use client";

import { useEffect, useState } from "react";
import { Badge, StatusBar, StatusItem } from "@xake/ui";
import { api } from "../../../lib/api-client";

interface Health {
  env: string;
  providers: {
    mock: { status: string; lastTickAt?: number; reconnectCount?: number };
    coinbase: { status: string; reconnectCount?: number };
  };
  claude: { enabled: boolean; defaultModel: string };
}

/**
 * Status rail. Polls /v1/health every 15s and degrades loudly if:
 *  - the API is unreachable
 *  - the mock feed reports anything other than "ok"
 *  - the last quote is older than 10s
 *
 * When any of those fire, the bar flips tone and surfaces a short
 * machine-readable reason in a dedicated "issue" column.
 */

export function StatusRail() {
  const [health, setHealth] = useState<Health | null>(null);
  const [apiReachable, setApiReachable] = useState(true);
  const [tz, setTz] = useState<string>("");

  useEffect(() => {
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const poll = async () => {
      try {
        const h = await api.get<Health>("/v1/health");
        setHealth(h);
        setApiReachable(true);
      } catch {
        setApiReachable(false);
      }
    };
    poll();
    const id = setInterval(poll, 15_000);
    return () => clearInterval(id);
  }, []);

  const mockStatus = health?.providers.mock.status ?? "unknown";
  const lastTickAt = health?.providers.mock.lastTickAt;
  const staleMs = lastTickAt ? Date.now() - lastTickAt : undefined;
  const stale = staleMs !== undefined && staleMs > 10_000;
  const feedTone: "positive" | "negative" | "warning" | "info" =
    !apiReachable ? "negative" : mockStatus === "down" ? "negative" : stale ? "warning" : mockStatus === "ok" ? "positive" : "warning";

  const issueLabel = !apiReachable
    ? "api unreachable"
    : mockStatus === "down"
      ? "feed down"
      : stale
        ? `stale ${Math.round((staleMs ?? 0) / 1000)}s`
        : undefined;

  return (
    <StatusBar>
      <StatusItem
        label="feed"
        value={`mock · ${!apiReachable ? "offline" : mockStatus}`}
        tone={feedTone}
      />
      <StatusItem
        label="ai"
        value={health?.claude.enabled ? health.claude.defaultModel : "mock"}
        tone={health?.claude.enabled ? "info" : "warning"}
      />
      <StatusItem label="env" value={health?.env ?? "paper"} tone="warning" />
      <StatusItem label="tz" value={tz || "system"} />
      {issueLabel ? (
        <span className="xake-statusbar__item">
          <span>issue</span>
          <Badge tone="negative" dot>
            {issueLabel}
          </Badge>
        </span>
      ) : null}
      <StatusItem label="build" value="v0.3" />
    </StatusBar>
  );
}
