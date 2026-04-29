"use client";
import { useState } from "react";
import type { Book, BookStatus } from "@/types";
import { useBooks } from "@/lib/context/BooksContext";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import StatusMenu, { STATUS_LABEL } from "@/components/library/StatusMenu";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="text-[#e0a020] text-[12px]">{i < n ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

export default function BookRow({ book }: { book: Book }) {
  const { setDetailBookId, deleteBook, updateBook, showToast } = useBooks();
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const abbr = book.title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  async function handleRemove() {
    setRemoving(true);
    try {
      await deleteBook(book.id);
      showToast(`"${book.title}" removed ✓`);
    } catch (err) {
      console.error("Failed to remove book:", err);
      showToast("Failed to remove book. Please try again.");
      setRemoving(false);
      setConfirming(false);
    }
  }

  async function handleStatusChange(newStatus: BookStatus) {
    if (newStatus === book.status || changing) return;
    setChanging(true);

    const updates: Partial<Book> = { status: newStatus };
    if (newStatus === "read") {
      if (!book.date_finished) updates.date_finished = new Date().toISOString().split("T")[0];
      if (!book.progress && book.pages) updates.progress = book.pages;
    }

    setLeaving(true);
    await new Promise((r) => setTimeout(r, 150));

    try {
      await updateBook(book.id, updates);
      showToast(`"${book.title}" → ${STATUS_LABEL[newStatus]} ✓`);
      setLeaving(false);
    } catch (err) {
      console.error("Failed to update book status:", err);
      showToast("Failed to update status. Please try again.");
      setLeaving(false);
    } finally {
      setChanging(false);
    }
  }

  return (
    <>
      {confirming && (
        <ConfirmDialog
          title={`Remove "${book.title}" from your library?`}
          onConfirm={handleRemove}
          onCancel={() => setConfirming(false)}
          loading={removing}
        />
      )}
      <div
        onClick={() => setDetailBookId(book.id)}
        className={`bg-bs-panel border border-bs-border rounded-[12px] px-4 py-[14px] flex items-center gap-[14px] hover:shadow-[0_3px_14px_rgba(0,0,0,0.07)] transition-all cursor-pointer ${
          leaving ? "opacity-0 -translate-x-1 pointer-events-none" : ""
        }`}
        style={{ transitionDuration: "150ms" }}
      >
        <div
          className="w-11 min-w-[44px] h-[62px] rounded-[5px] flex items-center justify-center text-white/55 font-serif font-bold text-base overflow-hidden"
          style={{ background: book.color }}
        >
          {book.cover_url ? (
            <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            abbr
          )}
        </div>

        <div className="flex-1 flex flex-col gap-[2px] min-w-0">
          <div className="text-[14px] font-semibold leading-tight truncate">{book.title}</div>
          <div className="text-[12px] text-bs-muted truncate">{book.author}</div>
        </div>

        <div className="text-[10px] bg-bs-tag text-bs-muted px-2 py-[3px] rounded-[4px]">{book.genre}</div>

        <div className="flex flex-col items-end gap-[6px] min-w-[100px]">
          {book.rating != null && <Stars n={book.rating} />}
          {book.date_finished && <span className="text-[11px] text-bs-faint">{book.date_finished}</span>}
        </div>

        <StatusMenu
          bookTitle={book.title}
          current={book.status}
          loading={changing}
          onChange={handleStatusChange}
          align="right"
          className="shrink-0"
        />

        <button
          onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
          disabled={removing}
          aria-label={`Remove ${book.title} from library`}
          className="p-[7px] rounded-[7px] border border-bs-border text-bs-faint hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait shrink-0"
          title="Remove from library"
        >
          {removing ? (
            <span className="text-[10px] font-medium">…</span>
          ) : (
            <TrashIcon />
          )}
        </button>
      </div>
    </>
  );
}
