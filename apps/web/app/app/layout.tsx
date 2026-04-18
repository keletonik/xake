import type { ReactNode } from "react";
import Link from "next/link";
import { AppBrand, PaperBanner, ThemeToggle, TopbarGroup } from "@xake/ui";
import { AppNav } from "./_ui/app-nav";
import { StatusRail } from "./_ui/status-rail";
import { AssistantDock } from "./_ui/assistant-dock";
import { AppCommandPalette } from "./_ui/command-palette";
import { TopbarUser } from "./_ui/topbar-user";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PaperBanner env="paper" />
      <div className="xake-shell" style={{ gridTemplateColumns: "var(--rail-w) 1fr" }}>
        <header className="xake-shell__topbar">
          <TopbarGroup>
            <Link href="/" style={{ textDecoration: "none" }}>
              <AppBrand />
            </Link>
            <span className="xake-micro-label">Workspace</span>
          </TopbarGroup>
          <TopbarGroup>
            <AppCommandPalette />
            <ThemeToggle />
            <TopbarUser />
          </TopbarGroup>
        </header>
        <aside className="xake-shell__rail" aria-label="Primary">
          <AppNav />
        </aside>
        <main
          className="xake-shell__main"
          style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr var(--drawer-w)" }}
        >
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {children}
          </div>
          <AssistantDock />
        </main>
        <StatusRail />
      </div>
    </>
  );
}
