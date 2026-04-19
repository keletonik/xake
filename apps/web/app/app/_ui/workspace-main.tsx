"use client";

import type { ReactNode } from "react";
import { usePreferences } from "../../../lib/use-preferences";
import { AssistantDock } from "./assistant-dock";

/**
 * The main area adapts to whether the user has the assistant turned on.
 * When `aiEnabled` is false the dock collapses and the content column
 * takes the full width, so there's no dead space.
 */

export function WorkspaceMain({ children }: { children: ReactNode }) {
  const prefs = usePreferences();
  const showDock = prefs.aiEnabled;

  return (
    <main
      className="xake-shell__main"
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: showDock ? "1fr var(--drawer-w)" : "1fr"
      }}
    >
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {children}
      </div>
      {showDock ? <AssistantDock /> : null}
    </main>
  );
}
