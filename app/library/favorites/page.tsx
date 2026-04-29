"use client";
import { useBooks } from "@/lib/context/BooksContext";
import BookCard from "@/components/library/BookCard";

export default function FavoritesPage() {
  const { books, loading, searchQuery } = useBooks();
  const filtered = books
    .filter((b) => (b.rating ?? 0) >= 4)
    .filter((b) =>
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.genre.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-[22px]">
        <h1 className="font-fraunces text-[26px] font-semibold">Favorites</h1>
        <span className="text-[13px] text-bs-muted">{filtered.length} books</span>
      </div>
      {loading ? (
        <div className="text-[13px] text-bs-muted">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-[13px] text-bs-muted">No favorites yet — mark a book as a favorite to see it here.</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-[14px]">
          {filtered.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      )}
    </div>
  );
}
