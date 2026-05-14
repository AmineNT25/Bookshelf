"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useBooks } from "@/lib/context/BooksContext";

export default function TopBar() {
  const router = useRouter();
  const { setAddBookOpen, setProfileOpen, setSearchQuery, searchQuery, profileCache } = useBooks();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const initials =
    ((profileCache.firstName[0] ?? "") + (profileCache.lastName[0] ?? ""))
      .toUpperCase() || "BS";

  function handleDropClick(fn: () => void) {
    setDropOpen(false);
    fn();
  }

  return (
    <div className="flex items-center gap-3 px-6 py-[14px] border-b border-bs-border bg-bs-bg shrink-0">
      {/* Saved-books filter */}
      <div className="flex-1 max-w-[340px] flex items-center gap-2 bg-bs-panel border border-bs-border rounded-[10px] px-[14px] py-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px] opacity-45 shrink-0">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={searchQuery}
          placeholder="Filter your saved books…"
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border-none bg-transparent outline-none text-[13px] text-bs-text placeholder:text-bs-faint min-w-0"
        />
      </div>

      <div className="flex items-center gap-[10px] ml-auto">
        {/* Add Book */}
        <button
          onClick={() => setAddBookOpen(true)}
          className="flex items-center gap-[7px] bg-bs-accent text-white rounded-[9px] px-4 py-2 text-[13px] font-medium hover:bg-bs-accent-hover hover:-translate-y-px active:translate-y-0 transition-all cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-[14px] h-[14px]">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Book
        </button>

        {/* Avatar */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen((v) => !v)}
            className="w-[34px] h-[34px] bg-bs-accent rounded-full text-white text-[12px] font-semibold flex items-center justify-center cursor-pointer hover:ring-[3px] hover:ring-bs-accent/20 hover:scale-105 transition-all overflow-hidden"
          >
            {profileCache.avatarUrl
              ? <img src={profileCache.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              : initials}
          </button>

          {dropOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
              <div className="absolute top-[calc(100%+8px)] right-0 bg-bs-panel border border-bs-border rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-[6px] min-w-[180px] z-50">
                <button
                  onClick={() => handleDropClick(() => setProfileOpen(true))}
                  className="flex items-center gap-[9px] w-full px-3 py-[9px] rounded-lg text-[13px] text-bs-muted hover:bg-bs-tag hover:text-bs-text transition-colors cursor-pointer text-left"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[14px] h-[14px] shrink-0">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  Edit Profile
                </button>
                <div className="h-px bg-bs-border my-1" />
                <button
                  onClick={() => handleDropClick(() => signOut({ callbackUrl: "/auth" }))}
                  className="flex items-center gap-[9px] w-full px-3 py-[9px] rounded-lg text-[13px] text-bs-accent hover:bg-bs-accent/[0.08] transition-colors cursor-pointer text-left"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[14px] h-[14px] shrink-0">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
