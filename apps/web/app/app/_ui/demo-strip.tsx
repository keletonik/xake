"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@xake/ui";
import { disableDemoMode, getDemoId, isDemoActive } from "../../../lib/demo-mode";

/**
 * Persistent demo strip shown inside /app when demo mode is active.
 * Sits directly under the paper banner so the user sees both signals:
 * "paper environment" (no real money) and "demo account" (isolated,
 * not signed in). Clicking Exit wipes the demo id + cookie and reloads
 * so the app re-resolves identity.
 */

export function DemoStrip() {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    setActive(isDemoActive());
    setId(getDemoId());
  }, []);

  if (!active) return null;

  const exit = () => {
    disableDemoMode();
    setActive(false);
    setId(null);
    router.replace("/");
  };

  return (
    <div className="xake-demo-strip" role="status" aria-live="polite">
      <Badge tone="info" dot>
        Demo account
      </Badge>
      <span className="xake-demo-strip__note">
        You're in an isolated demo. Virtual cash, virtual fills, no real money. State stays on the server against this browser only.
      </span>
      {id ? (
        <span className="xake-micro-label" style={{ color: "var(--colour-text-muted)" }}>
          id · {id.slice(0, 8)}
        </span>
      ) : null}
      <Button size="sm" variant="ghost" onClick={exit} style={{ marginLeft: "auto" }}>
        Exit demo
      </Button>
    </div>
  );
}
