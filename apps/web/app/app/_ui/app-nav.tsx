"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Kbd, RailHeading } from "@xake/ui";

const PRIMARY: Array<{ href: string; label: string; hint?: string }> = [
  { href: "/app", label: "Dashboard", hint: "D" },
  { href: "/app/markets", label: "Markets", hint: "M" },
  { href: "/app/charts", label: "Charts", hint: "C" },
  { href: "/app/watchlists", label: "Watchlists", hint: "W" },
  { href: "/app/alerts", label: "Alerts", hint: "A" },
  { href: "/app/portfolio", label: "Portfolio", hint: "P" },
  { href: "/app/paper", label: "Paper ticket", hint: "T" },
  { href: "/app/assistant", label: "Assistant", hint: "K" }
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
      <RailHeading>Workspace</RailHeading>
      {PRIMARY.map((item) => {
        const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className="xake-rail-item"
            data-active={active ? "true" : undefined}
          >
            <span>{item.label}</span>
            {item.hint ? <Kbd className="xake-rail-item__kbd">{item.hint}</Kbd> : null}
          </Link>
        );
      })}
      <RailHeading>Reference</RailHeading>
      <Link href="/style-guide" className="xake-rail-item">
        <span>Style guide</span>
      </Link>
      <Link href="/components" className="xake-rail-item">
        <span>Components</span>
      </Link>
    </nav>
  );
}
