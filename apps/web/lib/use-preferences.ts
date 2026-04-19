"use client";

import { useEffect, useState } from "react";
import { api } from "./api-client";

export interface Preferences {
  theme: "dark" | "darker" | "light" | "system";
  timezone?: string;
  defaultSymbol: string;
  defaultTimeframe: string;
  defaultWatchlistId?: string;
  aiEnabled: boolean;
  aiPremiumReasoning: boolean;
  notificationsInApp: boolean;
  notificationsEmail: boolean;
  notificationsWebhook?: string;
  paperStartingCash: number;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "dark",
  defaultSymbol: "AAPL",
  defaultTimeframe: "1h",
  aiEnabled: true,
  aiPremiumReasoning: false,
  notificationsInApp: true,
  notificationsEmail: false,
  paperStartingCash: 100_000
};

let cached: Preferences | null = null;
const listeners = new Set<(p: Preferences) => void>();

export const getCachedPreferences = (): Preferences | null => cached;

export const refreshPreferences = async (): Promise<Preferences> => {
  const res = await api.get<{ preferences: Preferences }>("/v1/preferences");
  cached = res.preferences;
  listeners.forEach((l) => l(res.preferences));
  return res.preferences;
};

/**
 * Subscribes the calling component to the shared preference store.
 * First mount triggers a fetch; subsequent mounts reuse the cache.
 */
export function usePreferences(): Preferences {
  const [value, setValue] = useState<Preferences>(cached ?? DEFAULT_PREFERENCES);

  useEffect(() => {
    let active = true;
    const fn = (p: Preferences) => {
      if (active) setValue(p);
    };
    listeners.add(fn);
    if (!cached) {
      refreshPreferences()
        .then(() => undefined)
        .catch(() => undefined);
    } else {
      setValue(cached);
    }
    return () => {
      active = false;
      listeners.delete(fn);
    };
  }, []);

  return value;
}

export const notifyPreferencesUpdated = (next: Preferences) => {
  cached = next;
  listeners.forEach((l) => l(next));
};
