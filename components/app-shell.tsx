"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Bot,
  CandlestickChart,
  LayoutDashboard,
  LineChart,
  List,
  Wallet,
} from "lucide-react";
import { EnvBadge } from "./ui/env-badge";
import { Kbd } from "./ui/kbd";
import { Monogram } from "./ui/wordmark";
import { cn } from "@/lib/utils";
import { StatusRail } from "./status-rail";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/markets", label: "Markets", icon: BarChart3 },
  { href: "/app/charts", label: "Charts", icon: CandlestickChart },
  { href: "/app/watchlists", label: "Watchlists", icon: List },
  { href: "/app/alerts", label: "Alerts", icon: Bell },
  { href: "/app/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/app/paper", label: "Paper", icon: LineChart },
  { href: "/app/assistant", label: "Assistant", icon: Bot },
];

export function AppShell({
  children,
  environment,
}: {
  children: React.ReactNode;
  environment: "paper" | "live";
}) {
  const path = usePathname();
  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-mute-10 px-4">
        <div className="flex items-center gap-4">
          <Link href="/app" className="flex items-center gap-2.5">
            <Monogram className="h-4 w-4" />
            <span className="font-sans text-[13px] font-black tracking-[0.28em]">XAKE</span>
          </Link>
          <span className="h-4 w-px bg-mute-10" />
          <EnvBadge environment={environment} />
        </div>
        <div className="flex items-center gap-4 text-mute-50">
          <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-caps md:flex">
            <span className="pulse-dot" />
            Markets Live
          </span>
          <span className="hidden items-center gap-1 font-mono text-[10px] uppercase tracking-caps md:flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
            Command
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-52 shrink-0 flex-col border-r border-mute-10 py-4 md:flex">
          <div className="px-4 pb-3 eyebrow">Workspace</div>
          <nav className="flex flex-col">
            {nav.map((n) => {
              const active = path === n.href || (n.href !== "/app" && path?.startsWith(n.href));
              const Icon = n.icon;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "group relative flex items-center gap-2.5 px-4 py-2 font-mono text-[11px] uppercase tracking-caps transition-colors",
                    active ? "text-fg bg-mute-4" : "text-mute-50 hover:text-fg",
                  )}
                >
                  {active && <span className="absolute left-0 top-0 h-full w-[2px] bg-accent" />}
                  <Icon className="size-3.5" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-mute-10 px-4 py-3 font-mono text-[10px] uppercase tracking-caps text-mute-40">
            <div className="flex items-center gap-2">
              <span className="pulse-dot" style={{ background: "#FF006E" }} />
              Paper mode · No live execution
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
      </div>

      <StatusRail />
    </div>
  );
}
