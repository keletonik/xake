"use client";

import { useEffect, useRef, useState } from "react";
import type { Quote } from "@xake/data-core";

/**
 * Subscribe to the SSE quote stream. Handles reconnection with
 * exponential backoff and surfaces a staleness indicator so the UI can
 * warn when the feed has gone quiet.
 */

export interface QuoteStreamState {
  readonly quotes: Record<string, Quote>;
  readonly connected: boolean;
  readonly staleMs: number;
  readonly source?: string;
}

export function useQuoteStream(symbols: string[]): QuoteStreamState {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<number>(Date.now());
  const [source, setSource] = useState<string | undefined>();

  const key = symbols.join(",");

  useEffect(() => {
    const url = key ? `/api/v1/stream/quotes?symbols=${encodeURIComponent(key)}` : `/api/v1/stream/quotes`;
    let ev: EventSource | null = null;
    let closed = false;
    let retry = 0;

    const connect = () => {
      ev = new EventSource(url);
      ev.addEventListener("hello", (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data);
          setSource(data.providers?.mock?.provider ?? "mock");
        } catch {
          /* ignore */
        }
      });
      ev.addEventListener("quote", (e) => {
        try {
          const q = JSON.parse((e as MessageEvent).data) as Quote;
          setQuotes((prev) => ({ ...prev, [q.symbol]: q }));
          setLastEvent(Date.now());
          retry = 0;
        } catch {
          /* ignore */
        }
      });
      ev.onopen = () => setConnected(true);
      ev.onerror = () => {
        setConnected(false);
        ev?.close();
        if (closed) return;
        retry = Math.min(6, retry + 1);
        setTimeout(connect, 500 * 2 ** retry);
      };
    };

    connect();
    return () => {
      closed = true;
      ev?.close();
    };
  }, [key]);

  const [staleMs, setStaleMs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStaleMs(Date.now() - lastEvent), 1000);
    return () => clearInterval(id);
  }, [lastEvent]);

  return { quotes, connected, staleMs, source };
}
