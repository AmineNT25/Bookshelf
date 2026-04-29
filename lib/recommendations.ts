import type { RecBook } from "@/types";

export const recommendations: Record<string, RecBook[]> = {
  scifi: [
    { title: "The Long Way to a Small, Angry Planet", author: "Becky Chambers", genre: "Space Opera", color: "#2a3a6a" },
    { title: "Recursion", author: "Blake Crouch", genre: "Thriller Sci-Fi", color: "#1a2a4a" },
    { title: "Children of Time", author: "Adrian Tchaikovsky", genre: "Science Fiction", color: "#3a1a5a" },
    { title: "Exhalation", author: "Ted Chiang", genre: "Short Stories", color: "#4a3a1a" },
    { title: "The Three-Body Problem", author: "Liu Cixin", genre: "Science Fiction", color: "#1a4a3a" },
  ],
  memoir: [
    { title: "When Breath Becomes Air", author: "Paul Kalanithi", genre: "Memoir", color: "#5a2a1a" },
    { title: "The Glass Castle", author: "Jeannette Walls", genre: "Memoir", color: "#3a1a1a" },
    { title: "Know My Name", author: "Chanel Miller", genre: "Memoir", color: "#5a1a4a" },
    { title: "Between the World and Me", author: "Ta-Nehisi Coates", genre: "Essay", color: "#1a3a5a" },
    { title: "H Is for Hawk", author: "Helen Macdonald", genre: "Nature Memoir", color: "#2a4a2a" },
  ],
  picks: [
    { title: "A Gentleman in Moscow", author: "Amor Towles", genre: "Historical Fiction", color: "#4a2a1a" },
    { title: "The Secret History", author: "Donna Tartt", genre: "Literary Fiction", color: "#2a1a4a" },
    { title: "Cloud Cuckoo Land", author: "Anthony Doerr", genre: "Fiction", color: "#1a5a4a" },
    { title: "Fourth Wing", author: "Rebecca Yarros", genre: "Fantasy Romance", color: "#5a1a2a" },
    { title: "Lessons in Chemistry", author: "Bonnie Garmus", genre: "Fiction", color: "#3a4a2a" },
  ],
};
