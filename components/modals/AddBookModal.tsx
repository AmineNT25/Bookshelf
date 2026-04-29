"use client";
import { useState } from "react";
import { useBooks } from "@/lib/context/BooksContext";

const GENRES = [
  "Fiction","Non-Fiction","Science Fiction","Fantasy","Mystery",
  "Memoir","Self-Help","Biography","History","Psychology","Classic","Other",
];

const inputCls =
  "w-full bg-bs-bg border border-bs-border rounded-[9px] py-[10px] px-[13px] text-[13px] " +
  "text-bs-text outline-none transition-colors placeholder:text-bs-faint " +
  "focus:border-bs-accent focus:shadow-[0_0_0_3px_rgba(193,68,14,0.12)]";
const labelCls = "block text-[12px] font-medium text-bs-muted mb-[6px]";

export default function AddBookModal() {
  const { addBookOpen, setAddBookOpen, prependBook, books, showToast } = useBooks();

  const [title, setTitle]             = useState("");
  const [author, setAuthor]           = useState("");
  const [genre, setGenre]             = useState("");
  const [coverUrl, setCoverUrl]       = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving]           = useState(false);

  if (!addBookOpen) return null;

  function reset() {
    setTitle(""); setAuthor(""); setGenre("");
    setCoverUrl(""); setDescription("");
  }

  function close() {
    setAddBookOpen(false);
    reset();
  }

  async function handleSave() {
    const t = title.trim();
    const a = author.trim();
    if (!t || !a) {
      showToast("Title and author are required");
      return;
    }
    if (books.some(
      (b) => b.title.toLowerCase() === t.toLowerCase() &&
             b.author.toLowerCase() === a.toLowerCase()
    )) {
      showToast(`"${t}" is already in your library`);
      return;
    }

    const body = {
      title: t,
      author: a,
      genre: genre || null,
      cover_url: coverUrl.trim() || null,
      description: description.trim() || null,
      status: "want_to_read",
      progress: 0,
      rating: 0,
    };

    setSaving(true);
    try {
      const res  = await fetch("/api/books", {
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
      showToast(`"${t}" added to your library ✓`);
      close();
    } catch {
      showToast("Could not save — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-[1.5rem]"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="bg-bs-panel rounded-[16px] w-full max-w-[540px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-h-[calc(100vh-3rem)] overflow-auto flex flex-col">

        <div className="flex items-center justify-between px-[1.75rem] py-[1.5rem] border-b border-bs-border flex-shrink-0">
          <div>
            <div className="font-fraunces text-[20px] font-semibold">Add a custom book</div>
            <div className="text-[12px] text-bs-muted mt-[2px]">For books that aren&apos;t in Open Library</div>
          </div>
          <button onClick={close} className="text-bs-muted hover:text-bs-text hover:bg-bs-tag rounded-lg p-1 transition-colors cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-[1.75rem] py-[1.5rem] overflow-y-auto flex-1">
          <div className="mb-4">
            <label className={labelCls}>Title *</label>
            <input
              autoFocus
              className={inputCls}
              placeholder="e.g. My Notebook"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className={labelCls}>Author *</label>
            <input
              className={inputCls}
              placeholder="e.g. Jane Doe"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className={labelCls}>Genre</label>
            <div className="flex flex-wrap gap-[6px] mt-1">
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(g === genre ? "" : g)}
                  className={`px-[11px] py-1 rounded-full text-[11px] border transition-all cursor-pointer ${
                    genre === g
                      ? "bg-bs-accent text-white border-bs-accent"
                      : "bg-bs-tag border-bs-border text-bs-muted hover:border-bs-muted"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className={labelCls}>Cover URL <span className="text-bs-faint font-normal">(optional)</span></label>
            <input
              className={inputCls}
              placeholder="https://…"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Description <span className="text-bs-faint font-normal">(optional)</span></label>
            <textarea
              rows={3}
              className={inputCls + " resize-none"}
              placeholder="A short summary or your own blurb…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-[10px] px-[1.75rem] py-[1.5rem] border-t border-bs-border flex-shrink-0">
          <button onClick={close} className="bg-transparent border border-bs-border rounded-[9px] px-[18px] py-[9px] text-[13px] text-bs-muted hover:bg-bs-tag transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-bs-accent text-white rounded-[9px] px-[18px] py-[9px] text-[13px] font-medium hover:bg-bs-accent-hover transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? "Adding…" : "Add to Library"}
          </button>
        </div>

      </div>
    </div>
  );
}
