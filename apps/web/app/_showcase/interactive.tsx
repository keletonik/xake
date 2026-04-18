"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  QuickTooltip,
  useToast
} from "@xake/ui";

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Reset paper balance</DialogTitle>
        <DialogDescription>
          This clears every paper position, fill, and pending order, and restores the starting
          balance. Nothing about your live account is affected.
        </DialogDescription>
        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger">Reset</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ToastDemo() {
  const { push } = useToast();
  return (
    <div className="showcase-row">
      <Button
        variant="secondary"
        onClick={() =>
          push({
            tone: "positive",
            title: "Paper order filled",
            description: "Bought 10 × AAPL @ 228.41"
          })
        }
      >
        Positive
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          push({
            tone: "negative",
            title: "Order rejected",
            description: "Quantity below venue minimum (0.1 BTC)"
          })
        }
      >
        Negative
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          push({
            tone: "warning",
            title: "Feed latency high",
            description: "Last tick was 14 seconds ago. Chart may be stale."
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          push({
            tone: "info",
            title: "Watchlist synced",
            description: "Imported 12 instruments from your backup."
          })
        }
      >
        Info
      </Button>
    </div>
  );
}

export function TooltipDemo() {
  return (
    <div className="showcase-row">
      <QuickTooltip label="Delayed quote — 15 min behind">
        <Button variant="ghost">Hover me</Button>
      </QuickTooltip>
      <QuickTooltip label="Open chart · G then C" side="bottom">
        <Button variant="secondary">Chart</Button>
      </QuickTooltip>
    </div>
  );
}
