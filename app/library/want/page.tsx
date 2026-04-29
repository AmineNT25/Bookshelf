"use client";
import { useBooks } from "@/lib/context/BooksContext";
import BookRow from "@/components/library/BookRow";

export default function WantPage() {
  const { books, loading, searchQuery } = useBooks();
  const filtered = books
    .filter((b) => b.status === "want_to_read")
    .filter((b) =>
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.genre.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-[22px]">
        <h1 className="font-fraunces text-[26px] font-semibold">Want to Read</h1>
        <span className="text-[13px] text-bs-muted">{filtered.length} books</span>
      </div>
      {loading ? (
        <div className="text-[13px] text-bs-muted">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-[13px] text-bs-muted">Nothing on your wishlist yet.</div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {filtered.map((b) => <BookRow key={b.id} book={b} />)}
        </div>
      )}
    </div>
  );
}
