"use client";
import { useEffect, useRef } from "react";

interface Props {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({ title, onConfirm, onCancel, loading = false }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="bg-bs-panel border border-bs-border rounded-[14px] shadow-2xl p-6 w-[320px] max-w-[90vw]"
      >
        <h2 id="confirm-dialog-title" className="text-[14px] font-semibold text-bs-text leading-snug mb-[6px]">
          {title}
        </h2>
        <p className="text-[12px] text-bs-muted mb-5">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            className="px-[14px] py-[7px] rounded-[7px] text-[12px] font-medium text-bs-text border border-bs-border hover:bg-bs-tag transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-[14px] py-[7px] rounded-[7px] text-[12px] font-medium text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            {loading ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}
