"use client";
import { useRef, useState } from "react";

interface Props {
  value: number | null;
  onChange?: (rating: number | null) => void;
  disabled?: boolean;
  saving?: boolean;
  /** id of an element that explains why this control is locked */
  describedById?: string;
}

export default function StarRating({
  value,
  onChange,
  disabled = false,
  saving = false,
  describedById,
}: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const interactive = !!onChange && !disabled && !saving;
  const display = hovered ?? value;

  function moveFocus(star: number) {
    refs.current[star - 1]?.focus();
  }

  function handleKey(e: React.KeyboardEvent, star: number) {
    if (!interactive || !onChange) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(5, star + 1);
      onChange(next);
      moveFocus(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = Math.max(1, star - 1);
      onChange(prev);
      moveFocus(prev);
    }
  }

  // Roving tabindex: only the active star (or star 1 if unrated) is reachable via Tab
  function tabIdx(star: number) {
    if (!interactive) return -1;
    return star === (value ?? 1) ? 0 : -1;
  }

  return (
    <div
      role={interactive ? "radiogroup" : "group"}
      aria-label={interactive ? "Rate this book" : "Book rating"}
      aria-disabled={!interactive ? true : undefined}
      aria-describedby={describedById}
      className="flex items-center gap-[3px]"
    >
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        const filled = display !== null && star <= display;
        return (
          <button
            key={star}
            ref={(el) => { refs.current[i] = el; }}
            role="radio"
            aria-label={`Rate ${star} out of 5`}
            aria-checked={value === star}
            tabIndex={tabIdx(star)}
            onClick={() => {
              if (!interactive || !onChange) return;
              onChange(star === value ? null : star);
            }}
            onMouseEnter={() => { if (interactive) setHovered(star); }}
            onMouseLeave={() => { if (interactive) setHovered(null); }}
            onKeyDown={(e) => handleKey(e, star)}
            className={`p-[2px] bg-transparent border-none text-[22px] leading-none rounded-[3px] transition-transform outline-none focus-visible:ring-2 focus-visible:ring-[#c1440e]/60 focus-visible:ring-offset-1 ${
              interactive
                ? "cursor-pointer hover:scale-110"
                : "cursor-default pointer-events-none opacity-60"
            }`}
          >
            <span className={filled ? "text-[#e0a020]" : "text-bs-faint"} aria-hidden="true">
              {filled ? "★" : "☆"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
