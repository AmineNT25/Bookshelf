export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

async function getUserId(): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const year = new Date().getFullYear();
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("reading_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("year", year)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? null);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { target } = await req.json();
  const year = new Date().getFullYear();

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("reading_goals")
    .upsert(
      { user_id: userId, year, target },
      { onConflict: "user_id,year" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
