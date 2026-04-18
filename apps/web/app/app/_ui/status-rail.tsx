"use client";

import { useEffect, useState } from "react";
import { StatusBar, StatusItem } from "@xake/ui";
import { api } from "../../../lib/api-client";

interface Health {
  env: string;
  providers: { mock: { status: string; lastTickAt?: number }; coinbase: { status: string } };
  claude: { enabled: boolean; defaultModel: string };
}

export function StatusRail() {
  const [health, setHealth] = useState<Health | null>(null);
  const [tz, setTz] = useState<string>("");

  useEffect(() => {
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const poll = async () => {
      try {
        const h = await api.get<Health>("/v1/health");
        setHealth(h);
      } catch {
        setHealth(null);
      }
    };
    poll();
    const id = setInterval(poll, 15_000);
    return () => clearInterval(id);
  }, []);

  const mockStatus = health?.providers.mock.status ?? "unknown";
  const feedTone: "positive" | "negative" | "warning" | "info" = mockStatus === "ok" ? "positive" : mockStatus === "down" ? "negative" : "warning";

  return (
    <StatusBar>
      <StatusItem label="feed" value={`mock · ${mockStatus}`} tone={feedTone} />
      <StatusItem
        label="ai"
        value={health?.claude.enabled ? health.claude.defaultModel : "mock"}
        tone={health?.claude.enabled ? "info" : "warning"}
      />
      <StatusItem label="env" value={health?.env ?? "paper"} tone="warning" />
      <StatusItem label="tz" value={tz || "system"} />
      <StatusItem label="build" value="stage-3-6" />
    </StatusBar>
  );
}
