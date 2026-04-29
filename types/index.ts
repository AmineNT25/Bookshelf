export type BookStatus = "reading" | "want_to_read" | "read" | "favorites";

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  genre: string;
  color: string;
  status: BookStatus;
  progress: number;
  rating?: number | null;
  pages?: number;
  notes?: string;
  date_finished?: string;
  cover_url?: string | null;
  description?: string | null;
  created_at: string;
}

export interface NewBook {
  title: string;
  author: string;
  genre?: string | null;
  color?: string;
  // Accepts any client string (e.g. "want_to_read", "currently_reading"); the
  // API normalises to the canonical BookStatus before insert.
  status?: BookStatus | "want_to_read" | "currently_reading" | "finished" | "favorite";
  progress?: number;
  rating?: number | null;
  pages?: number;
  notes?: string;
  cover_url?: string | null;
  description?: string | null;
}

export interface ReadingGoal {
  id: string;
  user_id: string;
  year: number;
  target: number;
}

export interface RecBook {
  title: string;
  author: string;
  genre: string;
  color: string;
}
