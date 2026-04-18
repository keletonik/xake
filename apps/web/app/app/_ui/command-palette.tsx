"use client";

import { useRouter } from "next/navigation";
import { Button, CommandPalette, Kbd, type CommandItem } from "@xake/ui";

export function AppCommandPalette() {
  const router = useRouter();

  const items: CommandItem[] = [
    { id: "go-dash", label: "Go to dashboard", group: "Navigate", keywords: ["home"], hint: "G D", onRun: () => router.push("/app") },
    { id: "go-markets", label: "Go to markets", group: "Navigate", hint: "G M", onRun: () => router.push("/app/markets") },
    { id: "go-charts", label: "Go to charts", group: "Navigate", hint: "G C", onRun: () => router.push("/app/charts") },
    { id: "go-watchlists", label: "Go to watchlists", group: "Navigate", hint: "G W", onRun: () => router.push("/app/watchlists") },
    { id: "go-alerts", label: "Go to alerts", group: "Navigate", hint: "G A", onRun: () => router.push("/app/alerts") },
    { id: "go-portfolio", label: "Go to portfolio", group: "Navigate", hint: "G P", onRun: () => router.push("/app/portfolio") },
    { id: "go-paper", label: "Open paper ticket", group: "Navigate", hint: "G T", onRun: () => router.push("/app/paper") },
    { id: "go-assistant", label: "Open assistant", group: "Navigate", hint: "G K", onRun: () => router.push("/app/assistant") },
    { id: "go-settings", label: "Open settings", group: "Navigate", hint: "G S", onRun: () => router.push("/app/settings") },
    { id: "chart-aapl", label: "Chart AAPL", group: "Instruments", keywords: ["apple"], onRun: () => router.push("/app/charts?symbol=AAPL") },
    { id: "chart-nvda", label: "Chart NVDA", group: "Instruments", keywords: ["nvidia"], onRun: () => router.push("/app/charts?symbol=NVDA") },
    { id: "chart-btc", label: "Chart BTC-USD", group: "Instruments", keywords: ["bitcoin", "crypto"], onRun: () => router.push("/app/charts?symbol=BTC-USD") },
    { id: "chart-eth", label: "Chart ETH-USD", group: "Instruments", keywords: ["ethereum", "crypto"], onRun: () => router.push("/app/charts?symbol=ETH-USD") }
  ];

  return (
    <>
      <CommandPalette items={items} />
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true, bubbles: true });
          window.dispatchEvent(ev);
        }}
        style={{ gap: 8 }}
      >
        Search
        <Kbd>⌘K</Kbd>
      </Button>
    </>
  );
}
