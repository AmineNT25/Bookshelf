"use client";
import Sidebar from "@/components/library/Sidebar";
import TopBar from "@/components/library/TopBar";
import AddBookModal from "@/components/modals/AddBookModal";
import ProfileModal from "@/components/modals/ProfileModal";
import GoalModal from "@/components/modals/GoalModal";
import BookDetailModal from "@/components/modals/BookDetailModal";
import { useBooks } from "@/lib/context/BooksContext";

function Toast() {
  const { toast } = useBooks();
  if (!toast) return null;
  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 bg-bs-text text-white px-5 py-[11px] rounded-[10px] text-[13px] z-[200] shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 whitespace-nowrap">
      {toast}
    </div>
  );
}

export default function LibraryShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto py-[26px] px-7">
          {children}
        </div>
      </main>
      <AddBookModal />
      <ProfileModal />
      <GoalModal />
      <BookDetailModal />
      <Toast />
    </div>
  );
}
