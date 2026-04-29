export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const ADMIN_USER_ID = "admin";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await getSupabase()
    .from("books")
    .select("*")
    .eq("id", id)
    .eq("user_id", ADMIN_USER_ID)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  // Defense in depth: notes and rating may only be written when the book is finished.
  if ("notes" in body || "rating" in body) {
    const { data: current } = await getSupabase()
      .from("books")
      .select("status")
      .eq("id", id)
      .eq("user_id", ADMIN_USER_ID)
      .single();

    if (!current || current.status !== "read") {
      return NextResponse.json(
        { error: "Reviews and ratings can only be added to finished books." },
        { status: 403 },
      );
    }
  }

  const { data, error } = await getSupabase()
    .from("books")
    .update(body)
    .eq("id", id)
    .eq("user_id", ADMIN_USER_ID)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await getSupabase()
    .from("books")
    .delete()
    .eq("id", id)
    .eq("user_id", ADMIN_USER_ID);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
