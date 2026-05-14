export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

async function getUserId(): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const supabase = await getSupabaseServerClient();

  // Defense in depth: notes and rating may only be written when the book is finished.
  if ("notes" in body || "rating" in body) {
    const { data: current } = await supabase
      .from("books")
      .select("status")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!current || current.status !== "read") {
      return NextResponse.json(
        { error: "Reviews and ratings can only be added to finished books." },
        { status: 403 },
      );
    }
  }

  const { data, error } = await supabase
    .from("books")
    .update(body)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("books")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
