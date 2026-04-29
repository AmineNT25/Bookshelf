"use client";
import { useEffect, useRef, useState } from "react";
import { useBooks } from "@/lib/context/BooksContext";

interface SubjectWork {
  key: string;
  title: string;
  authors?: { name: string; key: string }[];
  cover_id?: number;
  subject?: string[];
}

interface SearchDoc {
  key?: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  subject?: string[];
  first_sentence?: string[] | string;
}

interface CatalogueEntry {
  key: string;
  title: string;
  author: string;
  coverUrl: string | null;
  genre: string | null;
  description: string | null;
}

function normalizeFiction(works: SubjectWork[]): CatalogueEntry[] {
  return works.map((w) => ({
    key: w.key,
    title: w.title,
    author: w.authors?.[0]?.name ?? "Unknown",
    coverUrl: w.cover_id
      ? `https://covers.openlibrary.org/b/id/${w.cover_id}-M.jpg`
      : null,
    genre: w.subject?.[0] ?? null,
    description: null,
  }));
}

function normalizeSearch(docs: SearchDoc[]): CatalogueEntry[] {
  return docs.map((d) => ({
    key: d.key ?? `${d.title}::${d.author_name?.[0] ?? "Unknown"}`,
    title: d.title,
    author: d.author_name?.[0] ?? "Unknown",
    coverUrl: d.cover_i
      ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`
      : null,
    genre: d.subject?.[0] ?? null,
    description: Array.isArray(d.first_sentence)
      ? (d.first_sentence[0] ?? null)
      : typeof d.first_sentence === "string"
        ? d.first_sentence
        : null,
  }));
}

const inputCls =
  "w-full bg-bs-panel border border-bs-border rounded-[10px] py-[10px] pl-[2.5rem] pr-[2.5rem] text-[13px] " +
  "text-bs-text outline-none transition-colors placeholder:text-bs-faint " +
  "focus:border-bs-accent focus:shadow-[0_0_0_3px_rgba(193,68,14,0.12)]";

export default function AllBooksPage() {
  const { books, prependBook, showToast } = useBooks();

  const [catalogue, setCatalogue] = useState<CatalogueEntry[]>([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savedSet = new Set(books.map((b) => `${b.title}::${b.author}`));

  useEffect(() => {
    const trimmed = query.trim();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!trimmed) {
      setSearching(false);
      setLoadingCat(true);
      fetch("https://openlibrary.org/subjects/fiction.json?limit=24")
        .then((r) => r.json())
        .then((data) => setCatalogue(normalizeFiction(data.works ?? [])))
        .catch(() => setCatalogue([]))
        .finally(() => setLoadingCat(false));
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=24&fields=key,title,author_name,cover_i,subject,first_sentence`
        );
        const data = await res.json();
        setCatalogue(normalizeSearch(data.docs ?? []));
      } catch {
        setCatalogue([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  async function handleSave(entry: CatalogueEntry) {
    if (savingKey) return;
    const dedupKey = `${entry.title}::${entry.author}`;
    if (savedSet.has(dedupKey)) {
      showToast(`"${entry.title}" is already in your library`);
      return;
    }

    const body = {
      title: entry.title,
      author: entry.author,
      cover_url: entry.coverUrl,
      description: entry.description,
      genre: entry.genre,
      status: "want_to_read",
      progress: 0,
      rating: 0,
    };

    setSavingKey(entry.key);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        showToast(json?.error ?? "Could not save");
        return;
      }
      prependBook(json);
      console.log("[AllBooksPage] saved book:", json);
      showToast(`Saved "${entry.title}" ✓`);
    } catch {
      showToast("Could not save — try again");
    } finally {
      setSavingKey(null);
    }
  }

  const isLoading = loadingCat || searching;

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-[22px]">
        <h1 className="font-fraunces text-[26px] font-semibold">All Books</h1>
        {!isLoading && (
          <span className="text-[13px] text-bs-muted">{catalogue.length} books</span>
        )}
      </div>

      {/* Search */}
      <section className="mb-8 max-w-[640px]">
        <div className="relative">
          <svg
            className="absolute left-[0.85rem] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-bs-faint pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          {searching && (
            <svg
              className="absolute right-[0.85rem] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-bs-muted animate-spin"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <path d="M21 12a9 9 0 1 1-6.2-8.55" strokeLinecap="round"/>
            </svg>
          )}
          <input
            className={inputCls}
            placeholder="Search Open Library…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Catalogue grid */}
      {isLoading && (
        <div className="text-[13px] text-bs-muted">Loading catalogue…</div>
      )}

      {!isLoading && catalogue.length === 0 && (
        <div className="text-[13px] text-bs-muted">No results.</div>
      )}

      {!isLoading && catalogue.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[16px]">
          {catalogue.map((entry) => {
            const dedupKey = `${entry.title}::${entry.author}`;
            const alreadySaved = savedSet.has(dedupKey);
            const isSaving = savingKey === entry.key;
            return (
              <div key={entry.key} className="bg-bs-panel border border-bs-border rounded-[12px] overflow-hidden flex flex-col">
                <div className="w-full aspect-[2/3] bg-bs-tag flex items-center justify-center overflow-hidden">
                  {entry.coverUrl ? (
                    <img src={entry.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[11px] font-bold text-bs-muted px-2 text-center">
                      {entry.title.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <div className="text-[12px] font-semibold leading-tight line-clamp-2 mb-[2px]">{entry.title}</div>
                  <div className="text-[11px] text-bs-muted truncate mb-[6px]">{entry.author}</div>
                  {entry.genre && (
                    <div className="text-[10px] text-bs-faint bg-bs-tag px-[6px] py-[2px] rounded-[4px] self-start mb-3 truncate max-w-full">
                      {entry.genre}
                    </div>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={() => handleSave(entry)}
                    disabled={alreadySaved || isSaving}
                    className={`w-full text-[11px] font-medium py-[6px] rounded-[7px] transition-all cursor-pointer ${
                      alreadySaved
                        ? "bg-bs-tag text-bs-muted cursor-default"
                        : isSaving
                          ? "bg-bs-accent/70 text-white cursor-wait"
                          : "bg-bs-accent text-white hover:bg-bs-accent-hover"
                    }`}
                  >
                    {alreadySaved ? "✓ Saved" : isSaving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
