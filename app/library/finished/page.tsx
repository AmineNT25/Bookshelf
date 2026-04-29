"use client";
import { useBooks } from "@/lib/context/BooksContext";
import BookRow from "@/components/library/BookRow";

export default function FinishedPage() {
  const { books, loading, searchQuery } = useBooks();
  const finished = books.filter((b) => b.status === "read");
  const filtered = finished.filter((b) =>
    !searchQuery ||
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.genre.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalReviews = finished.filter((b) => b.notes && b.notes.trim().length > 0).length;
  const ratings = finished.map((b) => b.rating).filter((r): r is number => typeof r === "number");
  const avgRating = ratings.length
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : "—";
  const year = new Date().getFullYear();

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-[22px]">
        <h1 className="font-fraunces text-[26px] font-semibold">Read</h1>
        <span className="text-[13px] text-bs-muted">{filtered.length} books</span>
      </div>

      {finished.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="bg-bs-panel border border-bs-border rounded-[12px] px-5 py-4 flex-1 min-w-[140px]">
            <div className="font-fraunces text-[28px] font-semibold text-bs-accent">{finished.length}</div>
            <div className="text-[11px] text-bs-muted mt-[2px]">Books finished</div>
          </div>
          <div className="bg-bs-panel border border-bs-border rounded-[12px] px-5 py-4 flex-1 min-w-[140px]">
            <div className="font-fraunces text-[28px] font-semibold text-bs-accent">{totalReviews}</div>
            <div className="text-[11px] text-bs-muted mt-[2px]">Reviews written</div>
          </div>
          <div className="bg-bs-panel border border-bs-border rounded-[12px] px-5 py-4 flex-1 min-w-[140px]">
            <div className="font-fraunces text-[28px] font-semibold text-bs-accent">{avgRating}★</div>
            <div className="text-[11px] text-bs-muted mt-[2px]">Avg rating</div>
          </div>
          <div className="bg-bs-panel border border-bs-border rounded-[12px] px-5 py-4 flex-1 min-w-[140px]">
            <div className="font-fraunces text-[28px] font-semibold text-bs-accent">{year}</div>
            <div className="text-[11px] text-bs-muted mt-[2px]">Best reading year</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-[13px] text-bs-muted">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-[13px] text-bs-muted">No finished books yet.</div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {filtered.map((b) => <BookRow key={b.id} book={b} />)}
        </div>
      )}
    </div>
  );
}
