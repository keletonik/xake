"use client";

import {
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  createChart
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import type { Candle, Timeframe } from "@xake/data-core";
import type { ChartDataAdapter } from "./adapter";

export interface LightweightChartProps {
  readonly symbol: string;
  readonly timeframe: Timeframe;
  readonly adapter: ChartDataAdapter;
  readonly chartType?: "candles" | "line" | "area";
  readonly limit?: number;
  readonly height?: number;
  readonly onStatus?: (s: ChartStatus) => void;
}

export interface ChartStatus {
  readonly loading: boolean;
  readonly error?: string;
  readonly lastUpdate?: number;
  readonly source?: string;
  readonly staleMs?: number;
}

const CHART_COLOURS = {
  background: "rgba(0,0,0,0)",
  text: "#A8B0BF",
  grid: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  up: "#18C37E",
  down: "#FF5B6E",
  line: "#6EE7F9",
  area: "rgba(110,231,249,0.15)"
};

export function LightweightChart({
  symbol,
  timeframe,
  adapter,
  chartType = "candles",
  limit = 300,
  height = 440,
  onStatus
}: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | ISeriesApi<"Area"> | null>(null);
  const [status, setStatus] = useState<ChartStatus>({ loading: true, source: adapter.name });

  useEffect(() => {
    onStatus?.(status);
  }, [status, onStatus]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: CHART_COLOURS.background },
        textColor: CHART_COLOURS.text,
        fontFamily: "var(--font-mono)",
        fontSize: 11
      },
      grid: {
        vertLines: { color: CHART_COLOURS.grid, visible: true },
        horzLines: { color: CHART_COLOURS.grid }
      },
      rightPriceScale: {
        borderColor: CHART_COLOURS.border,
        entireTextOnly: true
      },
      timeScale: {
        borderColor: CHART_COLOURS.border,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 6
      },
      crosshair: {
        mode: 1,
        vertLine: { color: CHART_COLOURS.text, width: 1, style: 0 },
        horzLine: { color: CHART_COLOURS.text, width: 1, style: 0 }
      }
    });

    chartRef.current = chart;

    let unsub: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      setStatus((s) => ({ ...s, loading: true, error: undefined }));
      try {
        const candles = await adapter.loadCandles(symbol, timeframe, limit);
        if (cancelled) return;
        if (candles.length === 0) {
          setStatus((s) => ({ ...s, loading: false, error: "No data for symbol" }));
          return;
        }

        const series = mountSeries(chart, chartType);
        seriesRef.current = series;

        if (chartType === "candles") {
          (series as ISeriesApi<"Candlestick">).setData(candles.map(toCandleData));
        } else {
          (series as ISeriesApi<"Line">).setData(candles.map(toLineData));
        }

        chart.timeScale().fitContent();
        setStatus({ loading: false, source: adapter.name, lastUpdate: Date.now() });

        unsub = adapter.subscribe(symbol, timeframe, (candle, isNew) => {
          const s = seriesRef.current;
          if (!s) return;
          if (chartType === "candles") {
            (s as ISeriesApi<"Candlestick">).update(toCandleData(candle));
          } else {
            (s as ISeriesApi<"Line">).update(toLineData(candle));
          }
          setStatus((prev) => ({ ...prev, lastUpdate: Date.now() }));
          void isNew;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Chart failed to load";
        setStatus({ loading: false, error: message, source: adapter.name });
      }
    })();

    return () => {
      cancelled = true;
      unsub?.();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [symbol, timeframe, chartType, limit, adapter]);

  useEffect(() => {
    const tick = setInterval(() => {
      setStatus((prev) =>
        prev.lastUpdate ? { ...prev, staleMs: Date.now() - prev.lastUpdate } : prev
      );
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      {status.loading ? (
        <div
          aria-live="polite"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "var(--colour-text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase"
          }}
        >
          Loading chart…
        </div>
      ) : null}
      {status.error ? (
        <div
          role="alert"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "var(--colour-negative)",
            fontFamily: "var(--font-mono)",
            fontSize: 12
          }}
        >
          {status.error}
        </div>
      ) : null}
    </div>
  );
}

function mountSeries(
  chart: IChartApi,
  type: "candles" | "line" | "area"
): ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | ISeriesApi<"Area"> {
  if (type === "line") {
    return chart.addLineSeries({
      color: CHART_COLOURS.line,
      lineWidth: 2,
      priceLineVisible: true,
      priceLineColor: CHART_COLOURS.line
    });
  }
  if (type === "area") {
    return chart.addAreaSeries({
      lineColor: CHART_COLOURS.line,
      topColor: CHART_COLOURS.area,
      bottomColor: "rgba(110,231,249,0)",
      lineWidth: 2
    });
  }
  return chart.addCandlestickSeries({
    upColor: CHART_COLOURS.up,
    downColor: CHART_COLOURS.down,
    wickUpColor: CHART_COLOURS.up,
    wickDownColor: CHART_COLOURS.down,
    borderVisible: false
  });
}

const toCandleData = (c: Candle): CandlestickData => ({
  time: (c.openTime / 1000) as CandlestickData["time"],
  open: c.open,
  high: c.high,
  low: c.low,
  close: c.close
});

const toLineData = (c: Candle): LineData => ({
  time: (c.openTime / 1000) as LineData["time"],
  value: c.close
});
