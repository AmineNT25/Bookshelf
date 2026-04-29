"use client";
import { useEffect, useState } from "react";
import { useBooks } from "@/lib/context/BooksContext";

export default function GoalModal() {
  const { goalOpen, setGoalOpen, goal, books, updateGoal, showToast } = useBooks();
  const [target, setTarget] = useState(24);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (goalOpen) setTarget(goal?.target ?? 24);
  }, [goalOpen, goal]);

  if (!goalOpen) return null;

  const readCount = books.filter((b) => b.status === "read").length;
  const perMonth = Math.ceil(target / 12);
  const year = new Date().getFullYear();

  function close() { setGoalOpen(false); }

  async function handleSave() {
    setSaving(true);
    try {
      await updateGoal(target);
      showToast(`Goal set: ${target} books in ${year} ✓`);
      close();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-[1.5rem]"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="bg-bs-panel rounded-[16px] w-full max-w-[420px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-h-[calc(100vh-3rem)] overflow-auto flex flex-col">

        <div className="flex items-center justify-between px-[1.75rem] py-[1.5rem] border-b border-bs-border flex-shrink-0">
          <div className="font-fraunces text-[20px] font-semibold">Reading Goal {year}</div>
          <button onClick={close} className="text-bs-muted hover:text-bs-text hover:bg-bs-tag rounded-lg p-1 transition-colors cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-[1.75rem] py-[1.5rem] overflow-y-auto flex-1">
          <p className="text-[13px] text-bs-muted mb-5">How many books do you want to read this year?</p>

          <div className="text-center font-fraunces text-[40px] font-semibold text-bs-accent leading-none mt-2">{target}</div>
          <div className="text-center text-[12px] text-bs-muted mb-4">books in {year}</div>

          <input
            type="range"
            min={1}
            max={100}
            value={target}
            onChange={(e) => setTarget(parseInt(e.target.value))}
            className="w-full accent-bs-accent"
          />
          <div className="flex justify-between text-[11px] text-bs-faint mt-[6px] mb-5">
            <span>1</span><span>100</span>
          </div>

          <div className="bg-bs-bg rounded-[10px] p-[14px] text-[12px] text-bs-muted leading-relaxed">
            At this pace you need to finish about{" "}
            <strong className="text-bs-text">{perMonth} book{perMonth === 1 ? "" : "s"}/month</strong>{" "}
            to hit your goal. You&apos;ve read{" "}
            <strong className="text-bs-accent">{readCount}</strong> so far.
          </div>
        </div>

        <div className="flex justify-end gap-[10px] px-[1.75rem] py-[1.5rem] border-t border-bs-border flex-shrink-0">
          <button onClick={close} className="bg-transparent border border-bs-border rounded-[9px] px-[18px] py-[9px] text-[13px] text-bs-muted hover:bg-bs-tag transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="bg-bs-accent text-white rounded-[9px] px-[18px] py-[9px] text-[13px] font-medium hover:bg-bs-accent-hover transition-colors cursor-pointer disabled:opacity-60">
            {saving ? "Saving…" : "Save Goal"}
          </button>
        </div>

      </div>
    </div>
  );
}
