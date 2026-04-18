import type { Instrument } from "../types";

/**
 * A small, deterministic starter catalogue. Real provider integrations
 * will replace or extend this. Prices are only used to seed the mock
 * feed — nothing is treated as authoritative.
 */

interface Seed extends Instrument {
  readonly basePrice: number;
  readonly volatility: number;
}

export const CATALOGUE: ReadonlyArray<Seed> = [
  {
    id: "eq.aapl",
    symbol: "AAPL",
    displayName: "Apple Inc.",
    assetClass: "equity",
    venue: "NASDAQ",
    currency: "USD",
    tickSize: 0.01,
    lotSize: 1,
    sessionStatus: "regular",
    basePrice: 228.4,
    volatility: 0.012
  },
  {
    id: "eq.msft",
    symbol: "MSFT",
    displayName: "Microsoft Corporation",
    assetClass: "equity",
    venue: "NASDAQ",
    currency: "USD",
    tickSize: 0.01,
    lotSize: 1,
    sessionStatus: "regular",
    basePrice: 421.1,
    volatility: 0.010
  },
  {
    id: "eq.nvda",
    symbol: "NVDA",
    displayName: "NVIDIA Corporation",
    assetClass: "equity",
    venue: "NASDAQ",
    currency: "USD",
    tickSize: 0.01,
    lotSize: 1,
    sessionStatus: "regular",
    basePrice: 118.9,
    volatility: 0.022
  },
  {
    id: "eq.tsla",
    symbol: "TSLA",
    displayName: "Tesla, Inc.",
    assetClass: "equity",
    venue: "NASDAQ",
    currency: "USD",
    tickSize: 0.01,
    lotSize: 1,
    sessionStatus: "regular",
    basePrice: 244.3,
    volatility: 0.028
  },
  {
    id: "eq.spy",
    symbol: "SPY",
    displayName: "SPDR S&P 500 ETF Trust",
    assetClass: "equity",
    venue: "ARCA",
    currency: "USD",
    tickSize: 0.01,
    lotSize: 1,
    sessionStatus: "regular",
    basePrice: 568.7,
    volatility: 0.008
  },
  {
    id: "cr.btcusd",
    symbol: "BTC-USD",
    displayName: "Bitcoin",
    assetClass: "crypto",
    venue: "COINBASE",
    currency: "USD",
    tickSize: 0.01,
    lotSize: 0.00000001,
    sessionStatus: "24x7",
    basePrice: 63500,
    volatility: 0.018
  },
  {
    id: "cr.ethusd",
    symbol: "ETH-USD",
    displayName: "Ethereum",
    assetClass: "crypto",
    venue: "COINBASE",
    currency: "USD",
    tickSize: 0.01,
    lotSize: 0.00000001,
    sessionStatus: "24x7",
    basePrice: 3280,
    volatility: 0.022
  },
  {
    id: "cr.solusd",
    symbol: "SOL-USD",
    displayName: "Solana",
    assetClass: "crypto",
    venue: "COINBASE",
    currency: "USD",
    tickSize: 0.01,
    lotSize: 0.00000001,
    sessionStatus: "24x7",
    basePrice: 148.2,
    volatility: 0.035
  },
  {
    id: "fx.eurusd",
    symbol: "EUR/USD",
    displayName: "Euro vs US Dollar",
    assetClass: "fx",
    venue: "OANDA",
    currency: "USD",
    tickSize: 0.00001,
    lotSize: 1000,
    sessionStatus: "24x7",
    basePrice: 1.0812,
    volatility: 0.004
  },
  {
    id: "fx.gbpusd",
    symbol: "GBP/USD",
    displayName: "Pound vs US Dollar",
    assetClass: "fx",
    venue: "OANDA",
    currency: "USD",
    tickSize: 0.00001,
    lotSize: 1000,
    sessionStatus: "24x7",
    basePrice: 1.2684,
    volatility: 0.005
  }
];

export const bySymbol = (sym: string): Seed | undefined =>
  CATALOGUE.find((i) => i.symbol.toLowerCase() === sym.toLowerCase());
