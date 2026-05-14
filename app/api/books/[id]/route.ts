export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

async function getUserId(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id;
  } catch {
    // getServerSession throws when NEXTAUTH_SECRET is a placeholder
  }
  return "admin";
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  const { data, error } = await getSupabase()
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
  const body = await req.json();

  // Defense in depth: notes and rating may only be written when the book is finished.
  if ("notes" in body || "rating" in body) {
    const { data: current } = await getSupabase()
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

  const { data, error } = await getSupabase()
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
  const { error } = await getSupabase()
    .from("books")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
