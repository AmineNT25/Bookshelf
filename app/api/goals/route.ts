export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const ADMIN_USER_ID = "admin";

export async function GET() {
  const year = new Date().getFullYear();
  const { data, error } = await getSupabase()
    .from("reading_goals")
    .select("*")
    .eq("user_id", ADMIN_USER_ID)
    .eq("year", year)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? null);
}

export async function POST(req: Request) {
  const { target } = await req.json();
  const year = new Date().getFullYear();

  const { data, error } = await getSupabase()
    .from("reading_goals")
    .upsert(
      { user_id: ADMIN_USER_ID, year, target },
      { onConflict: "user_id,year" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
