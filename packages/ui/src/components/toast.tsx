"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { cn } from "../lib/cn";

type Tone = "neutral" | "positive" | "negative" | "warning" | "info";

interface ToastItem {
  id: number;
  title: ReactNode;
  description?: ReactNode;
  tone?: Tone;
  duration?: number;
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((toast: Omit<ToastItem, "id">) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), ...toast }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            duration={t.duration ?? 5000}
            onOpenChange={(open) => {
              if (!open) remove(t.id);
            }}
            data-tone={t.tone && t.tone !== "neutral" ? t.tone : undefined}
            className={cn("xake-toast")}
          >
            <div>
              <ToastPrimitive.Title className="xake-toast__title">{t.title}</ToastPrimitive.Title>
              {t.description ? (
                <ToastPrimitive.Description className="xake-toast__description">
                  {t.description}
                </ToastPrimitive.Description>
              ) : null}
            </div>
            <ToastPrimitive.Close className="xake-toast__close" aria-label="Dismiss">
              ×
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="xake-toast-viewport" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
