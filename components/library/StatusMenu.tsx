"use client";
import { useEffect, useRef, useState } from "react";
import type { BookStatus } from "@/types";

export const STATUSES: { value: BookStatus; label: string }[] = [
  { value: "want_to_read", label: "Want to Read" },
  { value: "reading",      label: "Currently Reading" },
  { value: "read",         label: "Read" },
  { value: "favorites",    label: "Favorites" },
];

export const STATUS_LABEL: Record<BookStatus, string> = {
  want_to_read: "Want to Read",
  reading:      "Currently Reading",
  read:         "Read",
  favorites:    "Favorites",
};

interface Props {
  bookTitle: string;
  current: BookStatus;
  loading: boolean;
  onChange: (status: BookStatus) => void;
  /** Which side the popover anchors to. Default "left" (full-width in card). */
  align?: "left" | "right";
  /** Which direction the popover opens. Default "up". */
  popoverDir?: "up" | "down";
  /** Extra className on the trigger button. */
  className?: string;
}

export default function StatusMenu({
  bookTitle,
  current,
  loading,
  onChange,
  align = "left",
  popoverDir = "up",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Close when pointer lands outside the whole widget
  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (itemsRef.current.some((el) => el?.contains(target))) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // Drive keyboard focus into the list whenever focusIdx changes while open
  useEffect(() => {
    if (open) itemsRef.current[focusIdx]?.focus();
  }, [open, focusIdx]);

  function openMenu() {
    const idx = STATUSES.findIndex((s) => s.value === current);
    setFocusIdx(idx >= 0 ? idx : 0);
    setOpen(true);
  }

  function select(value: BookStatus) {
    setOpen(false);
    triggerRef.current?.focus();
    if (value !== current) onChange(value);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      openMenu();
    }
    if (e.key === "Escape") setOpen(false);
  }

  function onItemKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((idx + 1) % STATUSES.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((idx - 1 + STATUSES.length) % STATUSES.length);
    } else if (e.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(STATUSES[idx].value);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  const popoverAnchor =
    align === "right"
      ? "right-0 left-auto min-w-[155px]"
      : "left-0 right-0";

  const popoverEdge =
    popoverDir === "up" ? "bottom-full mb-[5px]" : "top-full mt-[5px]";

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); open ? setOpen(false) : openMenu(); }}
        onKeyDown={onTriggerKeyDown}
        disabled={loading}
        aria-label={`Change status for ${bookTitle}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`text-[11px] font-medium py-[6px] rounded-[7px] border border-bs-border text-bs-muted hover:border-bs-faint hover:text-bs-text transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-[5px] px-[8px] ${className}`}
      >
        {loading ? (
          <span>Saving…</span>
        ) : (
          <>
            <svg
              width="9" height="9" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            <span className="truncate">{STATUS_LABEL[current] ?? current}</span>
          </>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={`Status options for ${bookTitle}`}
          className={`absolute ${popoverEdge} ${popoverAnchor} bg-bs-panel border border-bs-border rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.13)] py-[5px] z-[100]`}
        >
          {STATUSES.map((s, idx) => {
            const selected = s.value === current;
            return (
              <button
                key={s.value}
                ref={(el) => { itemsRef.current[idx] = el; }}
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                onClick={(e) => { e.stopPropagation(); select(s.value); }}
                onKeyDown={(e) => onItemKeyDown(e, idx)}
                className={`w-full text-left px-[10px] py-[7px] text-[12px] flex items-center gap-[8px] transition-colors cursor-pointer outline-none ${
                  selected
                    ? "text-bs-accent font-semibold bg-bs-tag"
                    : "text-bs-text hover:bg-bs-tag"
                }`}
              >
                <span className="w-[12px] shrink-0 text-bs-accent text-[10px]">
                  {selected ? "✓" : ""}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
