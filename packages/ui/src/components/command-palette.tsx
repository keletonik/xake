"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Dialog, DialogContent } from "./dialog";
import { cn } from "../lib/cn";

/**
 * Lightweight command palette. Cmd+K / Ctrl+K opens it. Arrow keys and
 * Enter handle selection. Consumers supply the command list — the
 * palette has no hard dependency on app state.
 */

export interface CommandItem {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  readonly group?: string;
  readonly keywords?: string[];
  readonly onRun: () => void;
}

export interface CommandPaletteProps {
  readonly items: CommandItem[];
  readonly placeholder?: string;
  readonly triggerLabel?: ReactNode;
}

export function CommandPalette({ items, placeholder = "Jump to, search, or run a command…" }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform);
      const wantOpen = (e.key === "k" || e.key === "K") && (isMac ? e.metaKey : e.ctrlKey);
      if (wantOpen) {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => {
      const hay = `${i.label} ${i.hint ?? ""} ${(i.keywords ?? []).join(" ")} ${i.group ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const run = (item: CommandItem) => {
    setOpen(false);
    setQuery("");
    queueMicrotask(() => item.onRun());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="xake-cmdk" closeLabel="Close command palette">
        <div className="xake-cmdk__input-row">
          <input
            ref={inputRef}
            autoFocus
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="xake-cmdk__input"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter") {
                const sel = filtered[activeIndex];
                if (sel) run(sel);
              }
            }}
          />
          <span className="xake-cmdk__hint">ESC</span>
        </div>
        <div role="listbox" className="xake-cmdk__list">
          {filtered.length === 0 ? (
            <div className="xake-cmdk__empty">No matches</div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                role="option"
                aria-selected={idx === activeIndex}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => run(item)}
                className={cn("xake-cmdk__item")}
                data-active={idx === activeIndex || undefined}
              >
                <span>{item.label}</span>
                {item.group ? <span className="xake-cmdk__group">{item.group}</span> : null}
                {item.hint ? <span className="xake-cmdk__kbd">{item.hint}</span> : null}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
