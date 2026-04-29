import { BooksProvider } from "@/lib/context/BooksContext";
import LibraryShell from "./LibraryShell";

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <BooksProvider>
      <LibraryShell>{children}</LibraryShell>
    </BooksProvider>
  );
}
