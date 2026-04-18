import {
  CoinbaseMarketDataProvider,
  MockMarketDataProvider,
  type MarketDataProvider,
  type Quote
} from "@xake/data-core";
import { env } from "../env.js";
import { store } from "../lib/store.js";

/**
 * The stream manager owns provider lifecycles and fan-out to SSE
 * subscribers. Providers live here, in the API; browsers only see
 * normalised quotes via the /v1/stream/quotes endpoint.
 *
 * Mock is always on. Coinbase is behind a flag — once enabled, BTC/ETH/SOL
 * subscriptions go to Coinbase and fall back to mock on disconnect.
 */

type QuoteHandler = (q: Quote) => void;

class StreamManager {
  private readonly mock = new MockMarketDataProvider({ tickIntervalMs: 1500 });
  private readonly coinbase = env.ENABLE_COINBASE_FEED ? new CoinbaseMarketDataProvider() : null;
  private readonly subs = new Map<string, Set<QuoteHandler>>();
  private started = false;

  private providerFor(symbol: string): MarketDataProvider {
    if (this.coinbase && /-USD$/i.test(symbol)) return this.coinbase;
    return this.mock;
  }

  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;
    await this.mock.start();
    if (this.coinbase) await this.coinbase.start();

    const fanOut = (q: Quote) => {
      store.tickWorkingOrders(q.symbol, q.last);
      this.subs.get(q.symbol)?.forEach((cb) => cb(q));
      this.subs.get("*")?.forEach((cb) => cb(q));
    };
    this.mock.subscribeQuotes([], fanOut);
  }

  async stop(): Promise<void> {
    await this.mock.stop();
    if (this.coinbase) await this.coinbase.stop();
    this.started = false;
  }

  subscribe(symbols: string[], handler: QuoteHandler): () => void {
    const targets = symbols.length ? symbols : ["*"];
    const unsubs: Array<() => void> = [];
    for (const s of targets) {
      let set = this.subs.get(s);
      if (!set) {
        set = new Set();
        this.subs.set(s, set);
      }
      set.add(handler);
      if (s !== "*" && this.coinbase && /-USD$/i.test(s)) {
        unsubs.push(
          this.coinbase.subscribeQuotes([s], (q) => {
            store.tickWorkingOrders(q.symbol, q.last);
            handler(q);
          })
        );
      }
    }
    return () => {
      for (const s of targets) this.subs.get(s)?.delete(handler);
      for (const u of unsubs) u();
    };
  }

  health() {
    return {
      mock: this.mock.health(),
      coinbase: this.coinbase?.health() ?? { provider: "coinbase", status: "off", reconnectCount: 0, checkedAt: Date.now() }
    };
  }
}

export const streamManager = new StreamManager();
