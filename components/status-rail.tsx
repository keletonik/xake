"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";

type Health = {
  ok: boolean;
  env: "paper" | "live";
  version: string;
  feed: { provider: string; feedClass: string; ageMs: number | null };
  ai: { configured: boolean; model: string };
  now: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function StatusRail() {
  const { data, error } = useSWR<Health>("/api/v1/health", fetcher, {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
  });

  const feedOk =
    data?.feed?.ageMs !== null && data?.feed?.ageMs !== undefined
      ? data.feed.ageMs < 60_000
      : true;

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-mute-10 px-4 font-mono text-[10px] uppercase tracking-caps text-mute-50">
      <div className="flex items-center gap-4">
        <Stat label="API" ok={!error && !!data} value={error ? "unreachable" : data ? "ok" : "…"} />
        <Stat label="Feed" ok={feedOk} value={data?.feed.provider ?? "…"} />
        <Stat label="AI" ok={!!data?.ai.configured} warn={!data?.ai.configured} value={data?.ai.configured ? "live" : "stub"} />
      </div>
      <div className="flex items-center gap-4">
        <span>{data?.env ?? "paper"}</span>
        <span>v{data?.version ?? "0.0.0"}</span>
      </div>
    </footer>
  );
}

function Stat({
  label,
  value,
  ok,
  warn,
}: {
  label: string;
  value: string;
  ok: boolean;
  warn?: boolean;
}) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden
        className={cn(
          "inline-block size-1.5",
          ok && !warn
            ? "bg-accent"
            : warn
              ? "bg-fg/60 animate-void-pulse"
              : "bg-fg/30 animate-void-pulse",
        )}
      />
      <span className="text-mute-40">{label}</span>
      <span className="text-fg">{value}</span>
    </span>
  );
}
