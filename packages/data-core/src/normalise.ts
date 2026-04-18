import type { Candle, Quote, Timeframe } from "./types";
import { TIMEFRAME_SECONDS } from "./types";

/**
 * Pure normalisation helpers. These exist so every consumer sees the
 * same rounded, stamped, sanitised data regardless of provider.
 */

export const alignToTimeframe = (timestampMs: number, tf: Timeframe): number => {
  const secs = TIMEFRAME_SECONDS[tf];
  const bucketMs = secs * 1000;
  return Math.floor(timestampMs / bucketMs) * bucketMs;
};

export const ageMs = (quote: Quote): number => Math.max(0, Date.now() - quote.timestamp);

export const isStale = (quote: Quote, thresholdMs = 5_000): boolean => ageMs(quote) > thresholdMs;

export const priceFormat = (n: number, tickSize: number): string => {
  const decimals = Math.max(0, Math.round(-Math.log10(tickSize)));
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const mergeTickIntoCandle = (
  current: Candle | null,
  tickPrice: number,
  tickVolume: number,
  tickMs: number,
  instrumentId: string,
  tf: Timeframe
): Candle => {
  const openTime = alignToTimeframe(tickMs, tf);
  if (!current || current.openTime !== openTime) {
    return {
      instrumentId,
      timeframe: tf,
      openTime,
      open: tickPrice,
      high: tickPrice,
      low: tickPrice,
      close: tickPrice,
      volume: tickVolume
    };
  }
  return {
    ...current,
    high: Math.max(current.high, tickPrice),
    low: Math.min(current.low, tickPrice),
    close: tickPrice,
    volume: current.volume + tickVolume
  };
};
