/**
 * Demo-mode client glue.
 *
 * The public site offers a "Try demo trading" affordance that opts the
 * browser into an isolated demo account. Each browser gets a stable
 * random demo id stored in localStorage; the id is sent to the API as
 * `x-xake-demo-id` on every request. The server scopes all state by
 * that id, so demo users never see each other's data and never touch
 * real user accounts.
 *
 * Turning demo mode off removes the id and the browser reverts to its
 * usual auth (Clerk or the dev fallback).
 */

const STORAGE_KEY = "xake-demo-id";
const COOKIE_KEY = "xake-demo-id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const randomId = (): string => {
  const g = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (g?.randomUUID) return g.randomUUID().replace(/-/g, "");
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
};

const readStorage = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const readCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE_KEY}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") || null : null;
};

const writeCookie = (value: string | null) => {
  if (typeof document === "undefined") return;
  if (value === null) {
    document.cookie = `${COOKIE_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
  } else {
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(value)}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
  }
};

export const isDemoActive = (): boolean => !!getDemoId();

export const getDemoId = (): string | null => {
  if (typeof window === "undefined") return null;
  return readStorage() ?? readCookie();
};

export const enableDemoMode = (): string => {
  if (typeof window === "undefined") throw new Error("enableDemoMode requires a browser");
  let id = readStorage() ?? readCookie();
  if (!id) id = randomId();
  window.localStorage.setItem(STORAGE_KEY, id);
  writeCookie(id);
  return id;
};

export const disableDemoMode = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  writeCookie(null);
};

export const demoHeaders = (): Record<string, string> => {
  const id = getDemoId();
  return id ? { "x-xake-demo-id": id } : {};
};
