"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useBooks } from "@/lib/context/BooksContext";

const NAV = [
  {
    href: "/library",
    label: "All Books",
    status: "all",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[15px] h-[15px] shrink-0">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: "/library/reading",
    label: "Currently Reading",
    status: "reading",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[15px] h-[15px] shrink-0">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    href: "/library/want",
    label: "Want to Read",
    status: "want",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[15px] h-[15px] shrink-0">
        <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    href: "/library/finished",
    label: "Read",
    status: "read",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[15px] h-[15px] shrink-0">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  {
    href: "/library/favorites",
    label: "Favorites",
    status: "favorites",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[15px] h-[15px] shrink-0">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    href: "/library/recommended",
    label: "Recommended",
    status: "recommended",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[15px] h-[15px] shrink-0">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { books, goal, setGoalOpen, searchQuery, setSearchQuery } = useBooks();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.access_token) return;
      const res = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setIsAdmin(true);
    });
  }, []);

  const counts = {
    all: books.length,
    reading:   books.filter((b) => b.status === "reading").length,
    want:      books.filter((b) => b.status === "want_to_read").length,
    read:      books.filter((b) => b.status === "read").length,
    favorites: books.filter((b) => (b.rating ?? 0) >= 4).length,
  };

  const readCount = counts.read;
  const target = goal?.target ?? 0;
  const pct = target > 0 ? Math.round((readCount / target) * 100) : 0;
  const year = new Date().getFullYear();

  return (
    <aside className="w-[210px] min-w-[210px] bg-bs-sidebar border-r border-bs-border flex flex-col py-5 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-[10px] px-[18px] pb-5 font-fraunces text-[17px] font-semibold">
        <div className="w-[30px] h-[30px] bg-bs-accent rounded-[6px] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" className="w-4 h-4">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        Bookshelf
      </div>

      {/* Search shelves */}
      <div className="mx-3 mb-5 flex items-center gap-[7px] bg-bs-bg border border-bs-border rounded-lg px-[10px] py-[7px]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px] shrink-0 opacity-50 text-bs-muted">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search shelves…"
          className="flex-1 border-none bg-transparent outline-none text-[12px] text-bs-text placeholder:text-bs-muted min-w-0"
        />
      </div>

      <div className="text-[9px] font-semibold tracking-[0.1em] uppercase text-bs-faint px-[18px] pb-2">Library</div>

      <nav className="flex flex-col">
        {NAV.map(({ href, label, status, icon }) => {
          const isActive = pathname === href;
          const count = status !== "all" && status !== "recommended" ? counts[status as keyof typeof counts] : status === "all" ? counts.all : undefined;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-[10px] px-[18px] py-[9px] text-[13px] border-l-2 transition-all ${
                isActive
                  ? "text-bs-accent border-bs-accent bg-bs-accent/[0.06] font-medium"
                  : "text-bs-muted border-transparent hover:bg-black/[0.04] hover:text-bs-text"
              }`}
            >
              {icon}
              {label}
              {count !== undefined && (
                <span className={`ml-auto text-[11px] ${isActive ? "text-bs-accent/70" : "text-bs-faint"}`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Admin link */}
      {isAdmin && (
        <div className="border-t border-bs-border pt-2 pb-1">
          <Link
            href="/admin"
            className={`flex items-center gap-[10px] px-[18px] py-[9px] text-[13px] border-l-2 transition-all ${
              pathname === "/admin"
                ? "text-bs-accent border-bs-accent bg-bs-accent/[0.06] font-medium"
                : "text-bs-muted border-transparent hover:bg-black/[0.04] hover:text-bs-text"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[15px] h-[15px] shrink-0">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Admin Panel
          </Link>
        </div>
      )}

      {/* Reading goal */}
      <div className="border-t border-bs-border px-[18px] pt-[14px] pb-[14px]">
        <div className="flex items-center justify-between mb-[10px]">
          <div className="text-[9px] font-semibold tracking-[0.1em] uppercase text-bs-faint">Reading Goal</div>
          <button
            onClick={() => setGoalOpen(true)}
            className="text-[10px] text-bs-accent bg-transparent border-none cursor-pointer font-medium hover:bg-bs-accent/10 px-[6px] py-[2px] rounded"
          >
            {goal ? "Change" : "Set Goal"}
          </button>
        </div>
        {goal ? (
          <>
            <div className="flex items-baseline gap-[6px]">
              <div className="font-fraunces text-[24px] font-semibold leading-none">
                {readCount} <span className="text-[13px] font-normal text-bs-muted">/ {goal.target} books</span>
              </div>
              <div className="text-[11px] text-bs-faint ml-auto">{year}</div>
            </div>
            <div className="bg-bs-border rounded-full h-[5px] my-[10px] overflow-hidden">
              <div className="h-full bg-bs-accent rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <div className="text-[10px] text-bs-faint">
              {pct}% complete · {Math.max(0, goal.target - readCount)} book{Math.max(0, goal.target - readCount) !== 1 ? "s" : ""} to go
            </div>
          </>
        ) : (
          <p className="text-[11px] text-bs-faint">Set a reading goal for {year}</p>
        )}
      </div>
    </aside>
  );
}
