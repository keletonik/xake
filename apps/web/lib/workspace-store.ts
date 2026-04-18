"use client";

import { create } from "zustand";
import type { Timeframe } from "@xake/data-core";

interface WorkspaceState {
  activeSymbol: string;
  activeTimeframe: Timeframe;
  chartType: "candles" | "line" | "area";
  selectedWatchlistId?: string;
  setActiveSymbol: (s: string) => void;
  setActiveTimeframe: (t: Timeframe) => void;
  setChartType: (t: "candles" | "line" | "area") => void;
  setSelectedWatchlist: (id: string | undefined) => void;
}

export const useWorkspace = create<WorkspaceState>((set) => ({
  activeSymbol: "AAPL",
  activeTimeframe: "1h",
  chartType: "candles",
  selectedWatchlistId: undefined,
  setActiveSymbol: (s) => set({ activeSymbol: s }),
  setActiveTimeframe: (t) => set({ activeTimeframe: t }),
  setChartType: (t) => set({ chartType: t }),
  setSelectedWatchlist: (id) => set({ selectedWatchlistId: id })
}));
