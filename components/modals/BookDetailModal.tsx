"use client";
import { useEffect, useRef, useState } from "react";
import { useBooks } from "@/lib/context/BooksContext";
import type { Book } from "@/types";
import StarRating from "@/components/library/StarRating";

const REVIEW_MAX = 2000;
const REVIEW_COUNTER_THRESHOLD = 1800;
const RATING_GATE_ID = "rating-gate-msg";
const REVIEW_GATE_ID = "review-gate-msg";

export default function BookDetailModal() {
  const { books, detailBookId, setDetailBookId, updateBook, showToast } = useBooks();
  const book = books.find((b) => b.id === detailBookId) ?? null;

  const [reviewText, setReviewText]       = useState("");
  const [saveStatus, setSaveStatus]       = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [ratingSaving, setRatingSaving]   = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync review text whenever a different book is opened
  useEffect(() => {
    setReviewText(book?.notes ?? "");
    setSaveStatus("idle");
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, [book?.id]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  if (!detailBookId) return null;

  function close() { setDetailBookId(null); }

  const isRead = book?.status === "read";
  const abbr   = book?.title?.split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase() ?? "";

  function handleReviewChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value.slice(0, REVIEW_MAX);
    setReviewText(val);
    setSaveStatus("idle");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!book || !isRead) return;

    debounceRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await updateBook(book.id, { notes: val });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus((s) => s === "saved" ? "idle" : s), 2000);
      } catch (err) {
        console.error("Failed to save review:", err);
        setSaveStatus("error");
        setReviewText(book.notes ?? "");
        showToast("Failed to save review. Please try again.");
      }
    }, 800);
  }

  async function handleRatingChange(rating: number | null) {
    if (!book || !isRead) return;
    setRatingSaving(true);
    try {
      await updateBook(book.id, { rating } as Partial<Book>);
    } catch (err) {
      console.error("Failed to save rating:", err);
      showToast("Failed to save rating. Please try again.");
    } finally {
      setRatingSaving(false);
    }
  }

  async function clearRating() {
    await handleRatingChange(null);
  }

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-[1.5rem]"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="bg-bs-panel rounded-[16px] w-full max-w-[640px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-h-[calc(100vh-3rem)] overflow-auto flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-[1.75rem] py-[1.5rem] border-b border-bs-border flex-shrink-0">
          <div className="font-fraunces text-[20px] font-semibold">Book Details</div>
          <button
            onClick={close}
            className="text-bs-muted hover:text-bs-text hover:bg-bs-tag rounded-lg p-1 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-[1.75rem] py-[1.5rem] overflow-y-auto flex-1">
          {!book ? (
            <div className="text-[13px] text-bs-muted">Book not found.</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">

              {/* Cover */}
              <div
                className="w-[160px] min-w-[160px] h-[224px] rounded-[8px] overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.12)] mx-auto md:mx-0 shrink-0"
                style={{ background: book.color || "#5a3a1a" }}
              >
                {book.cover_url ? (
                  <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-serif text-4xl font-bold text-white/55">
                    {abbr}
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="flex-1 min-w-0 flex flex-col gap-5">

                {/* Title + author */}
                <div>
                  {book.genre && (
                    <div className="inline-block bg-bs-tag text-bs-muted text-[11px] px-[10px] py-[3px] rounded-[4px] mb-3">
                      {book.genre}
                    </div>
                  )}
                  <h2 className="font-fraunces text-[24px] font-semibold leading-tight mb-1">{book.title}</h2>
                  <div className="text-[14px] text-bs-muted">by {book.author}</div>
                </div>

                {/* Rating */}
                <div>
                  <div className="text-[12px] text-bs-muted font-medium mb-[8px]">Rating</div>
                  {!isRead && (
                    <p id={RATING_GATE_ID} className="text-[11px] text-bs-faint mb-2 leading-snug">
                      Ratings unlock once you mark this book as Read.
                    </p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    <StarRating
                      value={book.rating ?? null}
                      onChange={isRead ? handleRatingChange : undefined}
                      disabled={!isRead}
                      saving={ratingSaving}
                      describedById={!isRead ? RATING_GATE_ID : undefined}
                    />
                    {ratingSaving && (
                      <span className="text-[11px] text-bs-faint">Saving…</span>
                    )}
                    {isRead && book.rating != null && !ratingSaving && (
                      <button
                        onClick={clearRating}
                        className="text-[11px] text-bs-faint hover:text-bs-muted underline cursor-pointer transition-colors"
                      >
                        Clear rating
                      </button>
                    )}
                    {!isRead && book.rating != null && (
                      <span className="text-[12px] text-bs-faint">{book.rating}/5</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {(book.description?.trim()) ? (
                  <div>
                    <div className="text-[12px] text-bs-muted font-medium mb-[6px]">Description</div>
                    <p className="text-[13px] text-bs-text leading-relaxed">{book.description}</p>
                  </div>
                ) : null}

                {/* Review */}
                <div>
                  <div className="flex items-center justify-between mb-[8px]">
                    <label
                      htmlFor="book-review"
                      className="text-[12px] text-bs-muted font-medium"
                    >
                      Your Review
                    </label>
                    <span className={`text-[11px] transition-opacity duration-300 ${
                      saveStatus === "saved"  ? "text-green-600 opacity-100" :
                      saveStatus === "saving" ? "text-bs-faint opacity-100" :
                      saveStatus === "error"  ? "text-red-500 opacity-100" :
                      "opacity-0"
                    }`}>
                      {saveStatus === "saved"  ? "Saved ✓" :
                       saveStatus === "saving" ? "Saving…" :
                       saveStatus === "error"  ? "Save failed" : "Saved ✓"}
                    </span>
                  </div>

                  {!isRead && (
                    <p id={REVIEW_GATE_ID} className="text-[11px] text-bs-faint mb-2 leading-snug">
                      You can write a review once you&apos;ve finished this book. Mark it as &ldquo;Read&rdquo; to unlock reviews.
                    </p>
                  )}

                  <div className="relative">
                    <textarea
                      id="book-review"
                      value={reviewText}
                      onChange={handleReviewChange}
                      disabled={!isRead || saveStatus === "saving"}
                      aria-label="Your personal review of this book"
                      aria-disabled={!isRead ? true : undefined}
                      aria-describedby={!isRead ? REVIEW_GATE_ID : undefined}
                      placeholder="Share your thoughts now that you've finished this book…"
                      rows={5}
                      maxLength={REVIEW_MAX}
                      className="w-full resize-none rounded-[9px] border border-bs-border bg-bs-bg text-[13px] text-bs-text placeholder:text-bs-faint px-[12px] py-[10px] outline-none focus:border-bs-accent/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {reviewText.length >= REVIEW_COUNTER_THRESHOLD && (
                      <span className={`absolute bottom-[10px] right-[10px] text-[10px] ${
                        reviewText.length >= REVIEW_MAX ? "text-red-500" : "text-bs-faint"
                      }`}>
                        {reviewText.length}/{REVIEW_MAX}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-[10px] px-[1.75rem] py-[1.5rem] border-t border-bs-border flex-shrink-0">
          <button
            onClick={close}
            className="bg-transparent border border-bs-border rounded-[9px] px-[18px] py-[9px] text-[13px] text-bs-muted hover:bg-bs-tag transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
