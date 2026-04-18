import type { Context } from "hono";
import { stream } from "hono/streaming";

/**
 * Tiny helper for Server-Sent Events. Hono's streaming utility handles
 * framing; this adds XAKE conventions: retry hint, comment pings, and
 * typed event emission.
 */

export interface SseEmitter {
  send: (event: string, data: unknown) => Promise<void>;
  ping: () => Promise<void>;
  close: () => Promise<void>;
}

export const openSse = (c: Context, handler: (e: SseEmitter) => Promise<void>) =>
  stream(c, async (s) => {
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache, no-transform");
    c.header("Connection", "keep-alive");
    c.header("X-Accel-Buffering", "no");

    const send = async (event: string, data: unknown) => {
      await s.write(`event: ${event}\n`);
      await s.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    const ping = async () => {
      await s.write(`: ping ${Date.now()}\n\n`);
    };
    const close = async () => {
      await s.close();
    };

    await s.write(`retry: 3000\n\n`);

    const heartbeat = setInterval(() => {
      ping().catch(() => undefined);
    }, 15_000);

    try {
      await handler({ send, ping, close });
    } finally {
      clearInterval(heartbeat);
    }
  });
