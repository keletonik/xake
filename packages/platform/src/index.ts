/**
 * @xake/platform — deployment adapters.
 *
 * The app core stays platform-agnostic. Anything that *must* behave
 * differently between Vercel and Replit lives here, behind a stable
 * contract, resolved at runtime from `DEPLOY_TARGET`.
 *
 * Targets:
 *   - "vercel"  — serverless functions, Vercel Cron, request-scoped streams
 *   - "replit"  — long-running VM, in-process cron, persistent upstream WS
 *   - "node"    — generic node runtime (dev, docker, fly, railway)
 */

export type DeployTarget = "vercel" | "replit" | "node";

export const resolveTarget = (explicit?: string): DeployTarget => {
  const raw = (explicit ?? globalEnv("DEPLOY_TARGET") ?? "").toLowerCase();
  if (raw === "vercel" || raw === "replit" || raw === "node") return raw;
  if (globalEnv("VERCEL") === "1" || globalEnv("VERCEL_URL")) return "vercel";
  if (globalEnv("REPL_ID") || globalEnv("REPLIT_DEPLOYMENT") || globalEnv("REPLIT_DB_URL")) return "replit";
  return "node";
};

const globalEnv = (key: string): string | undefined => {
  if (typeof process === "undefined") return undefined;
  return process.env?.[key];
};

// ============================================================
// Queue adapter
// ============================================================
export interface QueueJob<T = unknown> {
  readonly name: string;
  readonly payload: T;
  readonly id?: string;
  readonly runAt?: number;
}

export interface QueueAdapter {
  readonly kind: "memory" | "redis" | "db";
  enqueue<T>(job: QueueJob<T>): Promise<void>;
  drain(handler: (job: QueueJob<unknown>) => Promise<void>, opts?: { maxJobs?: number }): Promise<number>;
}

// ============================================================
// Cron adapter
// ============================================================
export interface CronSchedule {
  readonly name: string;
  readonly cron: string;
  readonly handler: () => Promise<void>;
}

export interface CronAdapter {
  readonly kind: "in-process" | "vercel-cron" | "external";
  register(schedule: CronSchedule): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

// ============================================================
// Realtime transport
// ============================================================
export interface RealtimeTransport {
  readonly kind: "persistent" | "request-scoped";
  readonly supportsUpstreamWs: boolean;
  readonly recommendedTickMs: number;
  readonly maxStreamDurationMs: number;
}

// ============================================================
// Observability adapter
// ============================================================
export interface ObservabilityAdapter {
  readonly kind: "console" | "otel" | "sentry" | "combined";
  captureException(err: unknown, ctx?: Record<string, unknown>): void;
  captureEvent(name: string, ctx?: Record<string, unknown>): void;
  timing(name: string, ms: number, ctx?: Record<string, unknown>): void;
}

// ============================================================
// Storage adapter (future file storage / blobs)
// ============================================================
export interface StorageAdapter {
  readonly kind: "none" | "vercel-blob" | "s3" | "local";
  putObject(key: string, value: Uint8Array, contentType?: string): Promise<string>;
  getObjectUrl(key: string): Promise<string | null>;
}

// ============================================================
// Platform summary
// ============================================================
export interface PlatformCapabilities {
  readonly target: DeployTarget;
  readonly longRunning: boolean;
  readonly cron: CronAdapter["kind"];
  readonly queue: QueueAdapter["kind"];
  readonly realtime: RealtimeTransport;
  readonly upstreamWs: boolean;
  readonly maxFunctionDurationS?: number;
  readonly note: string;
}

export const describeCapabilities = (target: DeployTarget = resolveTarget()): PlatformCapabilities => {
  switch (target) {
    case "vercel":
      return {
        target,
        longRunning: false,
        cron: "vercel-cron",
        queue: "db",
        realtime: {
          kind: "request-scoped",
          supportsUpstreamWs: false,
          recommendedTickMs: 2000,
          // Vercel Function max duration (Node): 10s Hobby, 60s Pro default, 300s with configuration.
          maxStreamDurationMs: 55_000
        },
        upstreamWs: false,
        maxFunctionDurationS: 60,
        note:
          "Vercel: serverless functions. Upstream WebSockets (Coinbase) are unsupported; use mock feed or an external worker. Cron is via Vercel Cron Jobs — Hobby runs once/day, Pro supports frequent schedules. Streams complete within function timeout; browsers reconnect via EventSource."
      };
    case "replit":
      return {
        target,
        longRunning: true,
        cron: "in-process",
        queue: "redis",
        realtime: {
          kind: "persistent",
          supportsUpstreamWs: true,
          recommendedTickMs: 1000,
          maxStreamDurationMs: 3_600_000
        },
        upstreamWs: true,
        note:
          "Replit: Reserved VM for apps/api and apps/worker. Upstream WS (Coinbase) supported. In-process cron is safe. For multi-instance scale, swap the in-memory queue for Redis/BullMQ."
      };
    case "node":
    default:
      return {
        target: "node",
        longRunning: true,
        cron: "in-process",
        queue: "memory",
        realtime: {
          kind: "persistent",
          supportsUpstreamWs: true,
          recommendedTickMs: 1500,
          maxStreamDurationMs: 3_600_000
        },
        upstreamWs: true,
        note:
          "Generic Node: local dev, Docker, Fly, Railway, self-hosted. Long-running. Everything on by default."
      };
  }
};

// ============================================================
// Concrete adapters
// ============================================================

/**
 * In-memory queue. Safe for single-instance dev or Vercel preview.
 * Not durable — jobs lost on restart.
 */
export class MemoryQueue implements QueueAdapter {
  readonly kind = "memory" as const;
  private readonly jobs: QueueJob<unknown>[] = [];

  async enqueue<T>(job: QueueJob<T>): Promise<void> {
    this.jobs.push(job as QueueJob<unknown>);
  }

  async drain(handler: (job: QueueJob<unknown>) => Promise<void>, opts: { maxJobs?: number } = {}): Promise<number> {
    const cap = opts.maxJobs ?? this.jobs.length;
    let done = 0;
    while (done < cap && this.jobs.length > 0) {
      const next = this.jobs.shift()!;
      if (next.runAt && next.runAt > Date.now()) {
        this.jobs.push(next);
        break;
      }
      await handler(next);
      done += 1;
    }
    return done;
  }
}

/**
 * In-process cron using setInterval. Only safe on long-running hosts.
 * A Vercel deployment must not use this — it would only run within the
 * lifespan of a single request. Use VercelCronAdapter instead (the
 * request-handler-based variant below).
 */
export class InProcessCronAdapter implements CronAdapter {
  readonly kind = "in-process" as const;
  private schedules: Array<CronSchedule & { timer?: ReturnType<typeof setInterval> }> = [];

  register(schedule: CronSchedule): void {
    this.schedules.push({ ...schedule });
  }

  async start(): Promise<void> {
    for (const s of this.schedules) {
      const everyMs = cronToIntervalMs(s.cron);
      if (!everyMs) continue;
      s.timer = setInterval(() => {
        void s.handler().catch((err) => console.error(`[xake:cron:${s.name}]`, err));
      }, everyMs);
    }
  }

  async stop(): Promise<void> {
    for (const s of this.schedules) if (s.timer) clearInterval(s.timer);
  }
}

/**
 * Vercel cron adapter: registration-only. Vercel invokes the configured
 * endpoints on its own schedule via vercel.json. The adapter simply
 * keeps a manifest of which handlers map to which routes so we can
 * dispatch requests and remain consistent with the in-process model.
 */
export class VercelCronAdapter implements CronAdapter {
  readonly kind = "vercel-cron" as const;
  private readonly registry = new Map<string, CronSchedule>();

  register(schedule: CronSchedule): void {
    this.registry.set(schedule.name, schedule);
  }

  async start(): Promise<void> {
    /* no-op: Vercel invokes HTTP endpoints per vercel.json */
  }
  async stop(): Promise<void> {
    /* no-op */
  }

  async invoke(name: string): Promise<void> {
    const s = this.registry.get(name);
    if (!s) throw new Error(`Unknown cron: ${name}`);
    await s.handler();
  }

  list(): CronSchedule[] {
    return Array.from(this.registry.values());
  }
}

/**
 * Very small cron-expression parser: supports `*\/N * * * *` (every N
 * minutes). Anything else returns null and the schedule is silently
 * skipped in-process. This is intentional — complex schedules belong
 * on Vercel Cron.
 */
const cronToIntervalMs = (cron: string): number | null => {
  const parts = cron.trim().split(/\s+/);
  if (parts.length < 5) return null;
  const min = parts[0]!;
  const m = /^\*\/(\d+)$/.exec(min);
  if (m && Number(m[1]) > 0) return Number(m[1]) * 60_000;
  if (min === "*") return 60_000;
  const numeric = Number(min);
  if (Number.isFinite(numeric)) return 60_000; // "0" → hourly-ish; good enough for dev
  return null;
};

// ============================================================
// Observability: console default
// ============================================================
export class ConsoleObservability implements ObservabilityAdapter {
  readonly kind = "console" as const;
  captureException(err: unknown, ctx?: Record<string, unknown>): void {
    console.error("[xake:obs:exception]", err, ctx ?? {});
  }
  captureEvent(name: string, ctx?: Record<string, unknown>): void {
    console.log(`[xake:obs:event] ${name}`, ctx ?? {});
  }
  timing(name: string, ms: number, ctx?: Record<string, unknown>): void {
    console.log(`[xake:obs:timing] ${name} ${ms}ms`, ctx ?? {});
  }
}

// ============================================================
// Factory
// ============================================================
export interface PlatformContext {
  readonly target: DeployTarget;
  readonly capabilities: PlatformCapabilities;
  readonly queue: QueueAdapter;
  readonly cron: CronAdapter;
  readonly observability: ObservabilityAdapter;
}

export const createPlatformContext = (opts: { target?: DeployTarget } = {}): PlatformContext => {
  const target = opts.target ?? resolveTarget();
  const capabilities = describeCapabilities(target);
  const queue = new MemoryQueue();
  const cron: CronAdapter = target === "vercel" ? new VercelCronAdapter() : new InProcessCronAdapter();
  return {
    target,
    capabilities,
    queue,
    cron,
    observability: new ConsoleObservability()
  };
};

export const PLATFORM_PACKAGE = "@xake/platform";
export const PLATFORM_STAGE = 7;
