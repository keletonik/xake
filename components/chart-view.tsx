"use client";

import * as React from "react";
import useSWR from "swr";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle, Timeframe } from "@/lib/data-core/types";
import { bollinger, ema, sma } from "@/lib/indicators";
import { cn } from "@/lib/utils";

const TFS: Timeframe[] = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"];
type ChartType = "candles" | "bars" | "line" | "area";
const CHART_TYPES: ChartType[] = ["candles", "bars", "line", "area"];

type IndicatorKey = "sma20" | "sma50" | "ema20" | "bb20";
const INDICATORS: Array<{ key: IndicatorKey; label: string }> = [
  { key: "sma20", label: "SMA 20" },
  { key: "sma50", label: "SMA 50" },
  { key: "ema20", label: "EMA 20" },
  { key: "bb20", label: "BB 20" },
];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CANDLE_UP = "#FF006E";
const CANDLE_DOWN = "#707070";
const INDICATOR_COLOURS: Record<IndicatorKey, string> = {
  sma20: "#FFFFFF",
  sma50: "#FF006E",
  ema20: "#9AF0FF",
  bb20: "rgba(255,255,255,0.35)",
};

export function ChartView({
  symbol,
  initialTf = "15m",
  onTimeframeChange,
}: {
  symbol: string;
  initialTf?: Timeframe;
  onTimeframeChange?: (tf: Timeframe) => void;
}) {
  const [tf, setTf] = React.useState<Timeframe>(initialTf);
  const [type, setType] = React.useState<ChartType>("candles");
  const [indicators, setIndicators] = React.useState<Set<IndicatorKey>>(new Set(["sma20"]));

  const containerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const priceSeriesRef = React.useRef<ISeriesApi<"Candlestick" | "Bar" | "Line" | "Area"> | null>(
    null,
  );
  const overlaysRef = React.useRef<Map<string, ISeriesApi<"Line">>>(new Map());

  const { data } = useSWR<{ candles: Candle[] }>(
    `/api/v1/candles?symbol=${encodeURIComponent(symbol)}&tf=${tf}&limit=300`,
    fetcher,
    { refreshInterval: 5_000 },
  );

  const candles = data?.candles ?? [];
  const latest = candles[candles.length - 1];

  React.useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor: "rgba(255,255,255,0.6)",
        fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
      timeScale: { borderColor: "rgba(255,255,255,0.08)", timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
      priceSeriesRef.current = null;
      overlaysRef.current.clear();
    };
  }, []);

  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (priceSeriesRef.current) {
      chart.removeSeries(priceSeriesRef.current);
      priceSeriesRef.current = null;
    }
    let series: ISeriesApi<"Candlestick" | "Bar" | "Line" | "Area">;
    if (type === "candles") {
      series = chart.addCandlestickSeries({
        upColor: CANDLE_UP,
        downColor: CANDLE_DOWN,
        borderUpColor: CANDLE_UP,
        borderDownColor: CANDLE_DOWN,
        wickUpColor: CANDLE_UP,
        wickDownColor: CANDLE_DOWN,
      });
    } else if (type === "bars") {
      series = chart.addBarSeries({ upColor: CANDLE_UP, downColor: CANDLE_DOWN });
    } else if (type === "line") {
      series = chart.addLineSeries({ color: "#FFFFFF", lineWidth: 1 });
    } else {
      series = chart.addAreaSeries({
        lineColor: CANDLE_UP,
        topColor: "rgba(255,0,110,0.25)",
        bottomColor: "rgba(255,0,110,0)",
        lineWidth: 1,
      });
    }
    priceSeriesRef.current = series;
    if (candles.length) writePriceData(series, candles, type);
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const series = priceSeriesRef.current;
    if (!series || candles.length === 0) return;
    writePriceData(series, candles, type);
    chartRef.current?.timeScale().fitContent();
  }, [candles, type]);

  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const closes = candles.map((c) => c.close);
    const times = candles.map((c) => c.time as UTCTimestamp);

    const wantedKeys = new Set<string>();
    const ensure = (id: string, color: string, values: number[], lineStyle = 0) => {
      wantedKeys.add(id);
      let line = overlaysRef.current.get(id);
      if (!line) {
        line = chart.addLineSeries({
          color,
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          lineStyle,
          crosshairMarkerVisible: false,
        });
        overlaysRef.current.set(id, line);
      }
      const data: LineData[] = times.map((t, i) => ({
        time: t,
        value: Number.isNaN(values[i]) ? 0 : values[i],
      }));
      const firstValid = values.findIndex((v) => !Number.isNaN(v));
      line.setData(firstValid < 0 ? [] : data.slice(firstValid));
    };

    if (indicators.has("sma20")) ensure("sma20", INDICATOR_COLOURS.sma20, sma(closes, 20));
    if (indicators.has("sma50")) ensure("sma50", INDICATOR_COLOURS.sma50, sma(closes, 50));
    if (indicators.has("ema20")) ensure("ema20", INDICATOR_COLOURS.ema20, ema(closes, 20));
    if (indicators.has("bb20")) {
      const b = bollinger(closes, 20, 2);
      ensure("bb20_u", INDICATOR_COLOURS.bb20, b.upper);
      ensure("bb20_m", INDICATOR_COLOURS.bb20, b.mid, 2);
      ensure("bb20_l", INDICATOR_COLOURS.bb20, b.lower);
    }

    for (const [id, line] of overlaysRef.current) {
      if (!wantedKeys.has(id)) {
        chart.removeSeries(line);
        overlaysRef.current.delete(id);
      }
    }
  }, [candles, indicators]);

  function toggleIndicator(k: IndicatorKey) {
    const next = new Set(indicators);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setIndicators(next);
  }

  function changeTf(next: Timeframe) {
    setTf(next);
    onTimeframeChange?.(next);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-mute-10 px-4 py-2">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[12px] font-semibold uppercase tracking-caps">{symbol}</span>
          {latest && (
            <span className="font-mono text-[12px] tabnums text-fg">
              {latest.close.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ButtonGroup
            value={tf}
            options={TFS.map((t) => ({ value: t, label: t }))}
            onChange={(v) => changeTf(v as Timeframe)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-mute-10 px-4 py-1.5">
        <ButtonGroup
          value={type}
          options={CHART_TYPES.map((c) => ({ value: c, label: c }))}
          onChange={(v) => setType(v as ChartType)}
        />
        <div className="flex items-center gap-1.5">
          {INDICATORS.map((ind) => {
            const on = indicators.has(ind.key);
            return (
              <button
                key={ind.key}
                onClick={() => toggleIndicator(ind.key)}
                className={cn(
                  "border px-2.5 py-1 font-mono text-[10px] uppercase tracking-caps transition-colors",
                  on
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-mute-20 text-mute-70 hover:border-accent hover:text-accent",
                )}
                style={on ? undefined : { borderColor: "rgba(255,255,255,0.2)" }}
              >
                {ind.label}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={containerRef} className="min-h-[360px] flex-1" />
    </div>
  );
}

function writePriceData(
  series: ISeriesApi<"Candlestick" | "Bar" | "Line" | "Area">,
  candles: Candle[],
  type: ChartType,
) {
  if (type === "candles" || type === "bars") {
    series.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );
  } else {
    series.setData(
      candles.map((c) => ({ time: c.time as UTCTimestamp, value: c.close })),
    );
  }
}

function ButtonGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "border border-l-0 px-3 py-1 font-mono text-[10px] uppercase tracking-caps transition-colors first:border-l",
              active
                ? "border-accent bg-accent text-accent-ink"
                : "border-mute-10 text-mute-70 hover:text-fg",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
