export function sma(values: number[], period: number): number[] {
  if (period < 1) return values.slice();
  const out = new Array<number>(values.length).fill(NaN);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

export function ema(values: number[], period: number): number[] {
  if (period < 1) return values.slice();
  const k = 2 / (period + 1);
  const out = new Array<number>(values.length).fill(NaN);
  let prev = 0;
  let seeded = false;
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) continue;
    if (!seeded) {
      let s = 0;
      for (let j = i - period + 1; j <= i; j++) s += values[j];
      prev = s / period;
      out[i] = prev;
      seeded = true;
    } else {
      prev = values[i] * k + prev * (1 - k);
      out[i] = prev;
    }
  }
  return out;
}

export function rsi(values: number[], period = 14): number[] {
  const out = new Array<number>(values.length).fill(NaN);
  if (values.length <= period) return out;
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];
    if (change >= 0) avgGain += change;
    else avgLoss -= change;
  }
  avgGain /= period;
  avgLoss /= period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

export function bollinger(values: number[], period = 20, mult = 2): {
  mid: number[];
  upper: number[];
  lower: number[];
} {
  const mid = sma(values, period);
  const upper = new Array<number>(values.length).fill(NaN);
  const lower = new Array<number>(values.length).fill(NaN);
  for (let i = period - 1; i < values.length; i++) {
    let sq = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const d = values[j] - mid[i];
      sq += d * d;
    }
    const sd = Math.sqrt(sq / period);
    upper[i] = mid[i] + mult * sd;
    lower[i] = mid[i] - mult * sd;
  }
  return { mid, upper, lower };
}

export function macd(values: number[], fast = 12, slow = 26, signal = 9): {
  macd: number[];
  signal: number[];
  histogram: number[];
} {
  const fastEma = ema(values, fast);
  const slowEma = ema(values, slow);
  const macdLine = values.map((_, i) =>
    Number.isNaN(fastEma[i]) || Number.isNaN(slowEma[i]) ? NaN : fastEma[i] - slowEma[i],
  );
  const cleanedForSignal = macdLine.map((v) => (Number.isNaN(v) ? 0 : v));
  const signalLine = ema(cleanedForSignal, signal).map((v, i) =>
    Number.isNaN(macdLine[i]) ? NaN : v,
  );
  const histogram = macdLine.map((v, i) =>
    Number.isNaN(v) || Number.isNaN(signalLine[i]) ? NaN : v - signalLine[i],
  );
  return { macd: macdLine, signal: signalLine, histogram };
}
