"use client";
import { useState } from "react";
import type { Book, BookStatus } from "@/types";
import { useBooks } from "@/lib/context/BooksContext";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import StatusMenu, { STATUS_LABEL } from "@/components/library/StatusMenu";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-[2px]" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`text-[12px] ${i < n ? "text-[#e0a020]" : "text-bs-faint"}`}>
          {i < n ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export default function BookCard({ book }: { book: Book }) {
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
        className={`bg-bs-panel border border-bs-border rounded-[12px] p-4 flex gap-[14px] hover:shadow-[0_4px_18px_rgba(0,0,0,0.09)] hover:-translate-y-px transition-all cursor-pointer ${
          leaving ? "opacity-0 scale-95 pointer-events-none" : ""
        }`}
        style={{ transitionDuration: "150ms" }}
      >
        <div
          className="w-[68px] min-w-[68px] h-24 rounded-[5px] flex items-center justify-center text-white/55 font-serif font-bold text-2xl shrink-0 overflow-hidden"
          style={{ background: book.color }}
        >
          {book.cover_url ? (
            <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            abbr
          )}
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="text-[14px] font-semibold leading-tight mb-[2px] line-clamp-2">{book.title}</div>
          <div className="text-[12px] text-bs-muted mb-[10px] truncate">{book.author}</div>
          <div className="inline-block self-start bg-bs-tag text-bs-muted text-[10px] px-2 py-[3px] rounded-[4px] mb-3 truncate max-w-full">
            {book.genre}
          </div>

          <div className="flex-1" />

          {book.rating != null && (
            <div className="mb-2">
              <Stars n={book.rating} />
            </div>
          )}

          <StatusMenu
            bookTitle={book.title}
            current={book.status}
            loading={changing}
            onChange={handleStatusChange}
            className="w-full mb-[6px]"
          />

          <button
            onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
            disabled={removing}
            aria-label={`Remove ${book.title} from library`}
            className="w-full text-[11px] font-medium py-[6px] rounded-[7px] border border-bs-border text-bs-muted hover:border-red-400 hover:text-red-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait"
          >
            {removing ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </>
  );
}
