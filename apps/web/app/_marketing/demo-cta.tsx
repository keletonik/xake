"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@xake/ui";
import { disableDemoMode, enableDemoMode, getDemoId } from "../../lib/demo-mode";

/**
 * Landing-page demo trading CTA. One click opts the browser into an
 * isolated demo account, routes the user into the workspace, and makes
 * the active state visible. A second click (when already in demo) opens
 * the workspace directly.
 */

export function DemoCta({ size = "lg" }: { size?: "md" | "lg" }) {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const existing = getDemoId();
    setActive(!!existing);
    setId(existing);
  }, []);

  const start = () => {
    const next = enableDemoMode();
    setActive(true);
    setId(next);
    router.push("/app");
  };

  const exit = () => {
    disableDemoMode();
    setActive(false);
    setId(null);
  };

  if (active) {
    return (
      <div style={{ display: "inline-flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Badge tone="positive" dot>
          Demo trading · on
        </Badge>
        <Button variant="primary" size={size} onClick={() => router.push("/app")}>
          Resume demo workspace
        </Button>
        <Button variant="ghost" size={size === "lg" ? "md" : "sm"} onClick={exit}>
          Exit demo
        </Button>
        {id ? (
          <span className="xake-micro-label" style={{ color: "var(--colour-text-muted)" }}>
            id · {id.slice(0, 8)}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <Button variant="secondary" size={size} onClick={start}>
      Try demo trading
    </Button>
  );
}
