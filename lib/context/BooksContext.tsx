"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Book, NewBook, ReadingGoal } from "@/types";

export interface ProfileCache {
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

interface BooksContextType {
  books: Book[];
  goal: ReadingGoal | null;
  loading: boolean;
  addBook: (book: NewBook) => Promise<void>;
  prependBook: (book: Book) => void;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  updateGoal: (target: number) => Promise<void>;
  addBookOpen: boolean;
  setAddBookOpen: (v: boolean) => void;
  profileOpen: boolean;
  setProfileOpen: (v: boolean) => void;
  goalOpen: boolean;
  setGoalOpen: (v: boolean) => void;
  detailBookId: string | null;
  setDetailBookId: (id: string | null) => void;
  toast: string;
  showToast: (msg: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  profileCache: ProfileCache;
  updateProfileCache: (patch: Partial<ProfileCache>) => void;
}

const BooksContext = createContext<BooksContextType | null>(null);

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [goal, setGoal] = useState<ReadingGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [detailBookId, setDetailBookId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [profileCache, setProfileCache] = useState<ProfileCache>({
    firstName: "",
    lastName: "",
    avatarUrl: "",
  });

  const updateProfileCache = useCallback((patch: Partial<ProfileCache>) => {
    setProfileCache((prev) => ({ ...prev, ...patch }));
  }, []);

  const booksRef = useRef<Book[]>([]);
  booksRef.current = books;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/books").then((r) => r.json()).catch(() => []),
      fetch("/api/goals").then((r) => r.json()).catch(() => null),
      fetch("/api/profile").then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([booksData, goalData, profileData]) => {
      console.log("[BooksContext] /api/books response:", booksData);
      if (Array.isArray(booksData)) setBooks(booksData);
      if (goalData?.id) setGoal(goalData);
      if (profileData) {
        setProfileCache({
          firstName: profileData.first_name ?? "",
          lastName:  profileData.last_name  ?? "",
          avatarUrl: profileData.avatar_url  ?? "",
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const addBook = useCallback(async (book: NewBook) => {
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...book, progress: book.progress ?? 0 }),
    });
    if (!res.ok) throw new Error("Failed to add book");
    const newBook: Book = await res.json();
    setBooks((prev) => [newBook, ...prev]);
  }, []);

  const prependBook = useCallback((book: Book) => {
    setBooks((prev) => [book, ...prev]);
  }, []);

  const updateBook = useCallback(async (id: string, updates: Partial<Book>) => {
    const original = booksRef.current.find((b) => b.id === id);
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));

    const res = await fetch(`/api/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      if (original) setBooks((prev) => prev.map((b) => (b.id === id ? original : b)));
      throw new Error("Failed to update book");
    }
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    const saved = booksRef.current.find((b) => b.id === id);
    setBooks((prev) => prev.filter((b) => b.id !== id));

    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (!res.ok) {
      if (saved) {
        setBooks((prev) => (prev.some((b) => b.id === id) ? prev : [saved, ...prev]));
      }
      throw new Error("Failed to remove book");
    }
  }, []);

  const updateGoal = useCallback(async (target: number) => {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target }),
    });
    if (res.ok) {
      const newGoal: ReadingGoal = await res.json();
      setGoal(newGoal);
    }
  }, []);

  return (
    <BooksContext.Provider
      value={{
        books,
        goal,
        loading,
        addBook,
        prependBook,
        updateBook,
        deleteBook,
        updateGoal,
        addBookOpen,
        setAddBookOpen,
        profileOpen,
        setProfileOpen,
        goalOpen,
        setGoalOpen,
        detailBookId,
        setDetailBookId,
        toast,
        showToast,
        searchQuery,
        setSearchQuery,
        profileCache,
        updateProfileCache,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error("useBooks must be used within BooksProvider");
  return ctx;
}
