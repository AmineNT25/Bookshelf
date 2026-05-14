export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

// Falls back to "admin" when OAuth is not yet configured, matching the pattern
// used by the books and goals APIs throughout this app.
async function getUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id;
  } catch {}
  return null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? {});
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const payload: Record<string, string | null> = {
    id: userId,
    updated_at: new Date().toISOString(),
  };
  if ("first_name" in body) payload.first_name = body.first_name?.trim() || null;
  if ("last_name"  in body) payload.last_name  = body.last_name?.trim()  || null;
  if ("email"      in body) payload.email      = body.email?.trim()      || null;
  if ("username"   in body) payload.username   = body.username?.trim()   || null;
  if ("bio"        in body) payload.bio        = body.bio?.trim()        || null;
  if ("avatar_url" in body) payload.avatar_url = body.avatar_url         || null;

  const { data, error } = await getSupabase()
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
