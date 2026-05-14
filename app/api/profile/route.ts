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

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
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

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
