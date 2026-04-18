import type { Candle, Timeframe } from "@xake/data-core";

/**
 * ChartDataAdapter decouples the chart from the data source. The chart
 * asks for candles and subscribes for tick updates. Any provider — mock
 * or live — implements this to feed the chart.
 */

export interface ChartDataAdapter {
  readonly name: string;
  loadCandles(symbol: string, timeframe: Timeframe, limit: number): Promise<Candle[]>;
  subscribe(
    symbol: string,
    timeframe: Timeframe,
    onCandle: (candle: Candle, isNewBar: boolean) => void
  ): () => void;
}

export interface ChartOptions {
  readonly symbol: string;
  readonly timeframe: Timeframe;
  readonly chartType?: "candles" | "line" | "area";
  readonly limit?: number;
}
