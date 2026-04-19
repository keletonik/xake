"use client";

import { useEffect } from "react";
import { useTheme } from "@xake/ui";
import { refreshPreferences } from "../../../lib/use-preferences";

/**
 * Loads server-side preferences once and reconciles them with the
 * client-only theme provider. The theme provider is the display
 * source of truth; the server preference is persisted state. If they
 * disagree, the server wins on first mount so the signed-in user sees
 * their chosen theme on any new device.
 */

export function PreferencesBootstrap() {
  const { theme: current, setTheme } = useTheme();

  useEffect(() => {
    let cancelled = false;
    refreshPreferences()
      .then((prefs) => {
        if (cancelled) return;
        if (prefs.theme && prefs.theme !== current) {
          setTheme(prefs.theme);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [current, setTheme]);

  return null;
}
