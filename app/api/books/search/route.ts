import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ docs: [] });

  const url =
    `https://openlibrary.org/search.json` +
    `?q=${encodeURIComponent(q)}` +
    `&fields=key,title,author_name,cover_i,subject,first_sentence` +
    `&limit=8`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("upstream error");
    const data = await res.json();
    return NextResponse.json({ docs: data.docs ?? [] });
  } catch {
    return NextResponse.json({ docs: [] }, { status: 502 });
  }
}
