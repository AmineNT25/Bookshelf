export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const COLORS = ["#5a3a1a","#1a3a5a","#2a5a2a","#4a2a7a","#6a2a2a","#1a4a4a","#5a1a3a","#3a4a1a"];

async function getUserId(): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// The client sends human-readable status values like "want_to_read" /
// "currently_reading" / "finished". The existing books.status CHECK constraint
// allows only the canonical short forms. Map before insert.
const STATUS_MAP: Record<string, string> = {
  want_to_read:      "want_to_read",
  want:              "want_to_read",
  currently_reading: "reading",
  reading:           "reading",
  finished:          "read",
  read:              "read",
  favorite:          "favorites",
  favorites:         "favorites",
};

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const title  = typeof body.title  === "string" ? body.title.trim()  : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";
  if (!title || !author) {
    return NextResponse.json({ error: "title and author required" }, { status: 400 });
  }

  const rawStatus = typeof body.status === "string" ? body.status : "want";
  const status    = STATUS_MAP[rawStatus] ?? "want";

  const payload: Record<string, unknown> = {
    user_id: userId,
    title,
    author,
    genre:       typeof body.genre       === "string" ? body.genre       : "Fiction",
    cover_url:   typeof body.cover_url   === "string" ? body.cover_url   : null,
    description: typeof body.description === "string" ? body.description : null,
    color:       typeof body.color       === "string" ? body.color       : COLORS[Math.floor(Math.random() * COLORS.length)],
    status,
    progress:    typeof body.progress    === "number" ? body.progress    : 0,
    rating:      typeof body.rating      === "number" && body.rating > 0 ? body.rating : null,
  };
  if (body.pages !== undefined) payload.pages = body.pages;
  if (body.notes !== undefined) payload.notes = body.notes;

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("books")
    .insert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
