import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const fraunces = Fraunces({
  variable: "--font-fraunces-var",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "600"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans-var",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bookshelf",
  description: "Your reading life, beautifully organized.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} h-full`}>
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
