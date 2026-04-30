"use client";
import { useState, useEffect, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type AdminUser = {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
};

type Book = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  status: string;
  created_at: string;
};

type Tab = "users" | "books";

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function fmtDate(s?: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("users");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Add user modal
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(async ({ data: { session } }) => {
      const t = session?.access_token ?? null;
      if (t) {
        const res = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (res.ok) {
          setToken(t);
          setIsAdmin(true);
          setAdminEmail(session.user?.email ?? null);
        }
      }
      setReady(true);
    });
  }, []);

  const authHeaders = useCallback(
    () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users", { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to load users");
    setUsers(data);
  }, [authHeaders]);

  const fetchBooks = useCallback(async () => {
    const res = await fetch("/api/admin/books", { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to load books");
    setBooks(data);
  }, [authHeaders]);

  useEffect(() => {
    if (!isAdmin || !token) return;
    setLoading(true);
    setError("");
    Promise.all([fetchUsers(), fetchBooks()])
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isAdmin, token, fetchUsers, fetchBooks]);

  async function deleteUser(id: string, email?: string) {
    if (!confirm(`Delete user "${email ?? id}"?\n\nThis is permanent and cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", headers: authHeaders() });
    if (res.ok) {
      setUsers((u) => u.filter((x) => x.id !== id));
    } else {
      const d = await res.json();
      alert(d.error ?? "Failed to delete user");
    }
  }

  async function deleteBook(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/books/${id}`, { method: "DELETE", headers: authHeaders() });
    if (res.ok) {
      setBooks((b) => b.filter((x) => x.id !== id));
    } else {
      const d = await res.json();
      alert(d.error ?? "Failed to delete book");
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email: newEmail, password: newPassword }),
    });
    const data = await res.json();
    setAddLoading(false);
    if (!res.ok) { setAddError(data.error ?? "Failed to create user"); return; }
    setUsers((u) => [data, ...u]);
    setShowAdd(false);
    setNewEmail("");
    setNewPassword("");
  }

  const userEmailMap = Object.fromEntries(users.map((u) => [u.id, u.email ?? u.id]));

  const inputCls =
    "w-full bg-bs-bg border border-bs-border rounded-[10px] py-[11px] px-[14px] text-[13px] text-bs-text outline-none focus:border-bs-accent focus:ring-[3px] focus:ring-bs-accent/10 placeholder:text-bs-faint transition-all";

  // ── Loading / Access Denied ──────────────────────────────────────────────
  if (!ready) {
    return (
      <div className="min-h-screen bg-bs-bg flex items-center justify-center">
        <p className="text-bs-muted text-[14px]">Loading…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-bs-bg flex flex-col items-center justify-center gap-3 font-sans">
        <div className="w-14 h-14 bg-bs-accent/10 rounded-full flex items-center justify-center mb-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="#c1440e" strokeWidth="2.2" strokeLinecap="round" className="w-7 h-7">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div className="font-fraunces text-[24px] font-semibold text-bs-text">Access Denied</div>
        <p className="text-[13px] text-bs-muted">You must sign in as an admin to view this page.</p>
        <a href="/auth" className="mt-2 text-[13px] text-bs-accent hover:underline font-medium">
          ← Back to Sign In
        </a>
      </div>
    );
  }

  // ── Admin Panel ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bs-bg font-sans">

      {/* Header */}
      <div className="bg-bs-sidebar border-b border-bs-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-bs-accent rounded-lg flex items-center justify-center shrink-0">
            <ShieldIcon />
          </div>
          <span className="font-fraunces text-[18px] font-semibold text-bs-text">Admin Panel</span>
        </div>
        <a href="/library" className="text-[12px] text-bs-muted hover:text-bs-text transition-colors">
          ← Back to Library
        </a>
      </div>

      <div className="px-8 pt-6 pb-10">

        {/* Tabs */}
        <div className="flex gap-1 bg-bs-tag rounded-[10px] p-1 w-fit mb-6">
          {(["users", "books"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-[7px] text-[13px] font-medium transition-all cursor-pointer ${
                tab === t ? "bg-bs-panel text-bs-text shadow-sm" : "text-bs-muted hover:text-bs-text"
              }`}
            >
              {t === "users" ? `Users (${users.length})` : `Books (${books.length})`}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 text-[12px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-fraunces text-[20px] font-semibold text-bs-text">Users</h2>
              <button
                onClick={() => setShowAdd(true)}
                className="bg-bs-accent text-white text-[13px] font-semibold rounded-[8px] px-4 py-2 hover:bg-bs-accent-hover transition-colors cursor-pointer"
              >
                + Add User
              </button>
            </div>

            {loading ? (
              <div className="text-[13px] text-bs-muted py-12 text-center">Loading users…</div>
            ) : (
              <div className="bg-bs-panel border border-bs-border rounded-[12px] overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-bs-border bg-bs-tag/40">
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-bs-muted uppercase tracking-wide">Email</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-bs-muted uppercase tracking-wide">Status</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-bs-muted uppercase tracking-wide">Created</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-bs-muted uppercase tracking-wide">Last Sign In</th>
                      <th className="px-5 py-3 w-20" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-bs-muted text-[13px]">
                          No users yet.
                        </td>
                      </tr>
                    )}
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-bs-border last:border-0 hover:bg-bs-tag/20 transition-colors">
                        <td className="px-5 py-3 text-bs-text font-medium">
                          {u.email ?? "—"}
                          {u.email === adminEmail && (
                            <span className="ml-2 text-[10px] font-semibold bg-bs-accent/15 text-bs-accent px-[6px] py-[2px] rounded-full">
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[11px] font-semibold px-[8px] py-[3px] rounded-full ${
                            u.email_confirmed_at
                              ? "bg-green-500/10 text-green-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}>
                            {u.email_confirmed_at ? "Confirmed" : "Pending"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-bs-muted">{fmtDate(u.created_at)}</td>
                        <td className="px-5 py-3 text-bs-muted">{fmtDate(u.last_sign_in_at)}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => deleteUser(u.id, u.email)}
                            className="text-[12px] text-red-400 hover:text-red-300 font-medium cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── BOOKS TAB ── */}
        {tab === "books" && (
          <div>
            <h2 className="font-fraunces text-[20px] font-semibold text-bs-text mb-4">All Books</h2>

            {loading ? (
              <div className="text-[13px] text-bs-muted py-12 text-center">Loading books…</div>
            ) : (
              <div className="bg-bs-panel border border-bs-border rounded-[12px] overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-bs-border bg-bs-tag/40">
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-bs-muted uppercase tracking-wide">Title</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-bs-muted uppercase tracking-wide">Author</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-bs-muted uppercase tracking-wide">Owner</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-bs-muted uppercase tracking-wide">Status</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-bs-muted uppercase tracking-wide">Added</th>
                      <th className="px-5 py-3 w-20" />
                    </tr>
                  </thead>
                  <tbody>
                    {books.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-bs-muted text-[13px]">
                          No books found.
                        </td>
                      </tr>
                    )}
                    {books.map((b) => (
                      <tr key={b.id} className="border-b border-bs-border last:border-0 hover:bg-bs-tag/20 transition-colors">
                        <td className="px-5 py-3 text-bs-text font-medium max-w-[200px] truncate">{b.title}</td>
                        <td className="px-5 py-3 text-bs-muted">{b.author}</td>
                        <td className="px-5 py-3 text-bs-muted text-[11px] max-w-[160px] truncate">
                          {userEmailMap[b.user_id] ?? `${b.user_id.slice(0, 8)}…`}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[11px] font-medium text-bs-accent bg-bs-accent/10 px-[8px] py-[3px] rounded-full capitalize">
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-bs-muted">{fmtDate(b.created_at)}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => deleteBook(b.id, b.title)}
                            className="text-[12px] text-red-400 hover:text-red-300 font-medium cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add User Modal ── */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-bs-panel border border-bs-border rounded-[14px] p-6 w-full max-w-[380px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-fraunces text-[20px] font-semibold text-bs-text mb-5">Add New User</h3>
            <form onSubmit={handleAddUser} noValidate>
              <div className="mb-4">
                <label className="block text-[12px] font-medium text-bs-muted mb-[6px]">Email address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-[12px] font-medium text-bs-muted mb-[6px]">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={inputCls}
                />
              </div>
              {addError && (
                <p className="text-[11px] text-red-400 mb-3 bg-red-400/10 rounded-lg px-3 py-2">{addError}</p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowAdd(false); setAddError(""); }}
                  className="flex-1 bg-bs-tag text-bs-muted rounded-[10px] py-[11px] text-[13px] font-medium hover:bg-bs-border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 bg-bs-accent text-white rounded-[10px] py-[11px] text-[13px] font-semibold hover:bg-bs-accent-hover transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {addLoading ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
