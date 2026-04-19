import type { ReactNode } from "react";
import Link from "next/link";
import { AppBrand, PaperBanner, ThemeToggle, TopbarGroup } from "@xake/ui";
import { AppNav } from "./_ui/app-nav";
import { StatusRail } from "./_ui/status-rail";
import { AppCommandPalette } from "./_ui/command-palette";
import { TopbarUser } from "./_ui/topbar-user";
import { DemoStrip } from "./_ui/demo-strip";
import { WorkspaceMain } from "./_ui/workspace-main";
import { PreferencesBootstrap } from "./_ui/preferences-bootstrap";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PaperBanner env="paper" />
      <DemoStrip />
      <PreferencesBootstrap />
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
        <WorkspaceMain>{children}</WorkspaceMain>
        <StatusRail />
      </div>
    </>
  );
}
